import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Database } from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openDatabase } from './db';
import { createPagesModule } from './pages';
import { createWorkspacesModule } from './workspaces';

let dir: string;
let file: string;
let opened: Database[];

// A real SQLite file with the real migrations, as the app uses
function open() {
    const db = openDatabase(file);
    opened.push(db);
    return db;
}

function countWorkspaces(db: Database, userId: string) {
    return db
        .prepare('SELECT count(*) FROM workspaces WHERE user_id = ?')
        .pluck()
        .get(userId);
}

// Makes every Page insert fail, to check that a Workspace is never left without its Page
function failPageInserts(db: Database) {
    db.exec(
        "CREATE TRIGGER fail_page_insert BEFORE INSERT ON pages BEGIN SELECT RAISE(ABORT, 'no page'); END",
    );
}

// Inserts a Workspace directly, to control its creation date precisely
function insertWorkspace(
    db: Database,
    userId: string,
    workspace: { id: string; name: string },
    createdAt: string,
) {
    db.prepare(
        'INSERT INTO workspaces (id, user_id, name, created_at) VALUES (?, ?, ?, ?)',
    ).run(workspace.id, userId, workspace.name, createdAt);
    return workspace;
}

// Inserts a Sous-page directly: the Pages module can't create one yet
function insertSubPage(db: Database, workspaceId: string, parentId: string) {
    const id = `sub-of-${parentId}`;
    db.prepare(
        `INSERT INTO pages (id, workspace_id, parent_id, title, created_at)
         VALUES (?, ?, ?, 'Sub-page', ?)`,
    ).run(id, workspaceId, parentId, new Date().toISOString());
    return id;
}

const firstName = (value: string | null | undefined) => async () => value;

beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'vision-test-'));
    file = path.join(dir, 'test.db');
    opened = [];
});

afterEach(() => {
    for (const db of opened) db.close();
    rmSync(dir, { recursive: true, force: true });
});

describe('getOrCreateDefault', () => {
    it('creates a Workspace for a user who has none', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);

        const workspace = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );

        expect(workspace.id).toEqual(expect.any(String));
        expect(await workspaces.get('user_a', workspace.id)).toEqual(workspace);
        expect(countWorkspaces(db, 'user_a')).toBe(1);
    });

    it('creates it with a single "New page" Page at its root', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);

        const workspace = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );

        expect(await createPagesModule(db).list('user_a', workspace.id)).toEqual([
            {
                id: expect.any(String),
                workspaceId: workspace.id,
                parentId: null,
                title: 'New page',
            },
        ]);
    });

    it("names it after the user's first name", async () => {
        const workspaces = createWorkspacesModule(open());

        const workspace = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );

        expect(workspace.name).toBe("Thibaut's workspace");
    });

    it.each([
        ['empty', ''],
        ['blank', '   '],
        ['null', null],
        ['undefined', undefined],
    ])('names it "My workspace" for a/an %s first name', async (_, value) => {
        const workspaces = createWorkspacesModule(open());

        const workspace = await workspaces.getOrCreateDefault(
            'user_a',
            firstName(value),
        );

        expect(workspace.name).toBe('My workspace');
    });

    it('returns the same Workspace on successive calls', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);

        const first = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );
        const second = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );

        expect(second).toEqual(first);
        expect(countWorkspaces(db, 'user_a')).toBe(1);
        expect(await createPagesModule(db).list('user_a', first.id)).toHaveLength(
            1,
        );
    });

    it('creates a single Workspace under concurrent calls', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);

        // Every call sees "no Workspace" before any of them gets to create one
        const results = await Promise.all(
            Array.from({ length: 5 }, () =>
                workspaces.getOrCreateDefault('user_a', firstName('Thibaut')),
            ),
        );

        expect(new Set(results.map((workspace) => workspace.id)).size).toBe(1);
        expect(countWorkspaces(db, 'user_a')).toBe(1);
        expect(
            await createPagesModule(db).list('user_a', results[0].id),
        ).toHaveLength(1);
    });

    it('creates a single Workspace under concurrent calls from two connections', async () => {
        const db = open();
        const one = createWorkspacesModule(db);
        const other = createWorkspacesModule(open());

        const [a, b] = await Promise.all([
            one.getOrCreateDefault('user_a', firstName('Thibaut')),
            other.getOrCreateDefault('user_a', firstName('Thibaut')),
        ]);

        expect(b).toEqual(a);
        expect(countWorkspaces(db, 'user_a')).toBe(1);
        expect(await createPagesModule(db).list('user_a', a.id)).toHaveLength(1);
    });

    it('keeps the name when the profile changes', async () => {
        const workspaces = createWorkspacesModule(open());
        await workspaces.getOrCreateDefault('user_a', firstName('Thibaut'));

        const loadRenamed = vi.fn(firstName('Tibo'));
        const workspace = await workspaces.getOrCreateDefault(
            'user_a',
            loadRenamed,
        );

        expect(workspace.name).toBe("Thibaut's workspace");
        expect(loadRenamed).not.toHaveBeenCalled();
    });

    it('gives each user their own Workspace', async () => {
        const workspaces = createWorkspacesModule(open());

        const a = await workspaces.getOrCreateDefault('user_a', firstName('Ada'));
        const b = await workspaces.getOrCreateDefault('user_b', firstName('Bob'));

        expect(b.id).not.toBe(a.id);
        expect(b.name).toBe("Bob's workspace");
    });

    it('keeps the initial Page away from other users', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);
        const pages = createPagesModule(db);
        const mine = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Ada'),
        );
        const theirs = await workspaces.getOrCreateDefault(
            'user_b',
            firstName('Bob'),
        );
        const [initial] = (await pages.list('user_a', mine.id))!;

        expect(await pages.list('user_b', mine.id)).toBeNull();
        expect(await pages.get('user_b', mine.id, initial.id)).toBeNull();
        expect(await pages.get('user_b', theirs.id, initial.id)).toBeNull();
    });

    it('creates no Workspace when its initial Page cannot be created', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);
        failPageInserts(db);

        await expect(
            workspaces.getOrCreateDefault('user_a', firstName('Thibaut')),
        ).rejects.toThrow();
        expect(await workspaces.list('user_a')).toEqual([]);
    });

    it('returns the first-created Workspace when the user has several', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);
        const recent = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );
        const older = insertWorkspace(
            db,
            'user_a',
            { id: 'older', name: 'Side projects' },
            '2020-01-01T00:00:00.000Z',
        );

        expect(await workspaces.get('user_a', 'older')).toEqual(older);
        expect(await workspaces.get('user_a', recent.id)).toEqual(recent);
        expect(
            await workspaces.getOrCreateDefault('user_a', firstName('Thibaut')),
        ).toEqual(older);
        expect(countWorkspaces(db, 'user_a')).toBe(2);
    });
});

describe('create', () => {
    it('creates a new Workspace for a user who has none', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);

        const workspace = await workspaces.create(
            'user_a',
            firstName('Thibaut'),
        );

        expect(workspace.id).toEqual(expect.any(String));
        expect(await workspaces.get('user_a', workspace.id)).toEqual(workspace);
        expect(countWorkspaces(db, 'user_a')).toBe(1);
    });

    it('creates it with a single "New page" Page at its root', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);
        await workspaces.getOrCreateDefault('user_a', firstName('Thibaut'));

        const workspace = await workspaces.create(
            'user_a',
            firstName('Thibaut'),
        );

        expect(await createPagesModule(db).list('user_a', workspace.id)).toEqual([
            {
                id: expect.any(String),
                workspaceId: workspace.id,
                parentId: null,
                title: 'New page',
            },
        ]);
    });

    it('creates a new Workspace on every call, even when the user has one', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);
        const first = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );

        const second = await workspaces.create('user_a', firstName('Thibaut'));
        const third = await workspaces.create('user_a', firstName('Thibaut'));

        expect(new Set([first.id, second.id, third.id]).size).toBe(3);
        expect(countWorkspaces(db, 'user_a')).toBe(3);
    });

    it("names it after the user's first name", async () => {
        const workspaces = createWorkspacesModule(open());

        const workspace = await workspaces.create(
            'user_a',
            firstName('Thibaut'),
        );

        expect(workspace.name).toBe("Thibaut's workspace");
    });

    it.each([
        ['empty', ''],
        ['blank', '   '],
        ['null', null],
        ['undefined', undefined],
    ])('names it "My workspace" for a/an %s first name', async (_, value) => {
        const workspaces = createWorkspacesModule(open());

        const workspace = await workspaces.create('user_a', firstName(value));

        expect(workspace.name).toBe('My workspace');
    });

    it('allows two Workspaces with the same name', async () => {
        const workspaces = createWorkspacesModule(open());

        const a = await workspaces.create('user_a', firstName('Thibaut'));
        const b = await workspaces.create('user_a', firstName('Thibaut'));

        expect(b.id).not.toBe(a.id);
        expect(b.name).toBe(a.name);
        expect(await workspaces.list('user_a')).toEqual([a, b]);
    });

    it('takes the first name at the time of creation', async () => {
        const workspaces = createWorkspacesModule(open());
        const before = await workspaces.create('user_a', firstName('Thibaut'));

        const after = await workspaces.create('user_a', firstName('Tibo'));

        expect(after.name).toBe("Tibo's workspace");
        expect(await workspaces.get('user_a', before.id)).toEqual(before);
        expect(before.name).toBe("Thibaut's workspace");
    });

    it('lists the created Workspace last', async () => {
        const workspaces = createWorkspacesModule(open());
        const first = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );

        const second = await workspaces.create('user_a', firstName('Thibaut'));
        const third = await workspaces.create('user_a', firstName('Tibo'));

        expect(await workspaces.list('user_a')).toEqual([first, second, third]);
    });

    it('keeps the created Workspace away from other users', async () => {
        const workspaces = createWorkspacesModule(open());
        const theirs = await workspaces.getOrCreateDefault(
            'user_b',
            firstName('Bob'),
        );

        const mine = await workspaces.create('user_a', firstName('Ada'));

        expect(await workspaces.get('user_b', mine.id)).toBeNull();
        expect(await workspaces.list('user_b')).toEqual([theirs]);
        expect(await workspaces.list('user_a')).toEqual([mine]);
    });

    it('keeps the initial Page away from other users', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);
        const pages = createPagesModule(db);
        const theirs = await workspaces.getOrCreateDefault(
            'user_b',
            firstName('Bob'),
        );

        const mine = await workspaces.create('user_a', firstName('Ada'));
        const [initial] = (await pages.list('user_a', mine.id))!;

        expect(await pages.list('user_b', mine.id)).toBeNull();
        expect(await pages.get('user_b', mine.id, initial.id)).toBeNull();
        expect(await pages.get('user_b', theirs.id, initial.id)).toBeNull();
    });

    it('creates no Workspace when its initial Page cannot be created', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);
        const existing = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );
        failPageInserts(db);

        await expect(
            workspaces.create('user_a', firstName('Thibaut')),
        ).rejects.toThrow();
        expect(await workspaces.list('user_a')).toEqual([existing]);
    });

    it('leaves getOrCreateDefault returning the first-created Workspace', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);
        const first = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );
        await workspaces.create('user_a', firstName('Thibaut'));
        await workspaces.create('user_a', firstName('Tibo'));

        expect(
            await workspaces.getOrCreateDefault('user_a', firstName('Tibo')),
        ).toEqual(first);
        expect(countWorkspaces(db, 'user_a')).toBe(3);
    });
});

describe('get', () => {
    it('returns null for a Workspace that does not exist', async () => {
        const workspaces = createWorkspacesModule(open());

        expect(await workspaces.get('user_a', 'missing')).toBeNull();
    });

    it("returns null for another user's Workspace", async () => {
        const workspaces = createWorkspacesModule(open());
        const workspace = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );

        expect(await workspaces.get('user_b', workspace.id)).toBeNull();
    });
});

describe('list', () => {
    it('returns an empty list for a user who has no Workspace', async () => {
        const workspaces = createWorkspacesModule(open());

        expect(await workspaces.list('user_a')).toEqual([]);
    });

    it("lists all the user's Workspaces, oldest first", async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);
        const first = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );
        // Inserted out of order, both dated after the first
        const third = insertWorkspace(
            db,
            'user_a',
            { id: 'third', name: 'Clients' },
            '2999-01-02T00:00:00.000Z',
        );
        const second = insertWorkspace(
            db,
            'user_a',
            { id: 'second', name: 'Side projects' },
            '2999-01-01T00:00:00.000Z',
        );

        expect(await workspaces.list('user_a')).toEqual([first, second, third]);
    });

    it("leaves out other users' Workspaces", async () => {
        const workspaces = createWorkspacesModule(open());
        const mine = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Ada'),
        );
        await workspaces.getOrCreateDefault('user_b', firstName('Bob'));

        expect(await workspaces.list('user_a')).toEqual([mine]);
    });
});

describe('delete', () => {
    it('deletes the Workspace when the user has another one', async () => {
        const workspaces = createWorkspacesModule(open());
        const first = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );
        const second = await workspaces.create('user_a', firstName('Thibaut'));

        expect(await workspaces.delete('user_a', second.id)).toBe(true);
        expect(await workspaces.get('user_a', second.id)).toBeNull();
        expect(await workspaces.list('user_a')).toEqual([first]);
    });

    it('deletes all its Pages, Sous-pages included', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);
        const pages = createPagesModule(db);
        await workspaces.getOrCreateDefault('user_a', firstName('Thibaut'));
        const workspace = await workspaces.create('user_a', firstName('Thibaut'));
        const [initial] = (await pages.list('user_a', workspace.id))!;
        const other = (await pages.createAtRoot('user_a', workspace.id))!;
        const sub = insertSubPage(db, workspace.id, initial.id);
        const subSub = insertSubPage(db, workspace.id, sub);

        expect(await workspaces.delete('user_a', workspace.id)).toBe(true);
        for (const pageId of [initial.id, other.id, sub, subSub]) {
            expect(await pages.get('user_a', workspace.id, pageId)).toBeNull();
        }
        expect(await pages.list('user_a', workspace.id)).toBeNull();
    });

    it("leaves the user's other Workspaces and their Pages intact", async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);
        const pages = createPagesModule(db);
        const first = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );
        const doomed = await workspaces.create('user_a', firstName('Thibaut'));
        const third = await workspaces.create('user_a', firstName('Tibo'));
        await pages.createAtRoot('user_a', third.id);
        const firstPages = await pages.list('user_a', first.id);
        const thirdPages = await pages.list('user_a', third.id);

        await workspaces.delete('user_a', doomed.id);

        expect(await workspaces.list('user_a')).toEqual([first, third]);
        expect(await pages.list('user_a', first.id)).toEqual(firstPages);
        expect(await pages.list('user_a', third.id)).toEqual(thirdPages);
    });

    it("returns false for the user's last Workspace and deletes nothing", async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);
        const pages = createPagesModule(db);
        const workspace = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );
        const before = await pages.list('user_a', workspace.id);

        expect(await workspaces.delete('user_a', workspace.id)).toBe(false);
        expect(await workspaces.list('user_a')).toEqual([workspace]);
        expect(await pages.list('user_a', workspace.id)).toEqual(before);
    });

    it('returns false for a Workspace already deleted', async () => {
        const workspaces = createWorkspacesModule(open());
        const first = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );
        const second = await workspaces.create('user_a', firstName('Thibaut'));
        const third = await workspaces.create('user_a', firstName('Thibaut'));
        await workspaces.delete('user_a', second.id);

        expect(await workspaces.delete('user_a', second.id)).toBe(false);
        expect(await workspaces.list('user_a')).toEqual([first, third]);
    });

    it('returns false for a Workspace that does not exist', async () => {
        const workspaces = createWorkspacesModule(open());
        const first = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );
        const second = await workspaces.create('user_a', firstName('Thibaut'));

        expect(await workspaces.delete('user_a', 'missing')).toBe(false);
        expect(await workspaces.list('user_a')).toEqual([first, second]);
    });

    it("returns false for another user's Workspace and leaves it intact", async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);
        const pages = createPagesModule(db);
        // The caller has several Workspaces, so only ownership stops the delete
        const mine = await workspaces.getOrCreateDefault('user_a', firstName('Ada'));
        const alsoMine = await workspaces.create('user_a', firstName('Ada'));
        const theirs = await workspaces.getOrCreateDefault('user_b', firstName('Bob'));
        const theirOther = await workspaces.create('user_b', firstName('Bob'));
        const theirPages = await pages.list('user_b', theirs.id);

        expect(await workspaces.delete('user_a', theirs.id)).toBe(false);
        expect(await workspaces.list('user_b')).toEqual([theirs, theirOther]);
        expect(await pages.list('user_b', theirs.id)).toEqual(theirPages);
        expect(await workspaces.list('user_a')).toEqual([mine, alsoMine]);
    });

    it('refuses to delete the Workspace left by a delete from another connection', async () => {
        const db = open();
        const one = createWorkspacesModule(db);
        const other = createWorkspacesModule(open());
        const first = await one.getOrCreateDefault('user_a', firstName('Thibaut'));
        const second = await one.create('user_a', firstName('Thibaut'));

        const results = await Promise.all([
            one.delete('user_a', first.id),
            other.delete('user_a', second.id),
        ]);

        expect(results.filter(Boolean)).toHaveLength(1);
        expect(countWorkspaces(db, 'user_a')).toBe(1);
    });

    it('deletes the first-created Workspace, after which getOrCreateDefault returns the oldest left', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);
        const first = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );
        const second = await workspaces.create('user_a', firstName('Tibo'));
        await workspaces.create('user_a', firstName('Tibo'));

        expect(await workspaces.delete('user_a', first.id)).toBe(true);

        const loadFirstName = vi.fn(firstName('Thibaut'));
        expect(
            await workspaces.getOrCreateDefault('user_a', loadFirstName),
        ).toEqual(second);
        expect(loadFirstName).not.toHaveBeenCalled();
        expect(countWorkspaces(db, 'user_a')).toBe(2);
    });
});

describe('persistence', () => {
    it('keeps Workspaces after the database is closed and reopened', async () => {
        const before = open();
        const workspace = await createWorkspacesModule(before).getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );
        before.close();

        const workspaces = createWorkspacesModule(open());

        expect(await workspaces.get('user_a', workspace.id)).toEqual(workspace);
        expect(
            await workspaces.getOrCreateDefault('user_a', firstName('Tibo')),
        ).toEqual(workspace);
    });

    it('keeps created Workspaces after the database is closed and reopened', async () => {
        const before = open();
        const beforeWorkspaces = createWorkspacesModule(before);
        const first = await beforeWorkspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );
        const created = await beforeWorkspaces.create(
            'user_a',
            firstName('Thibaut'),
        );
        before.close();

        const workspaces = createWorkspacesModule(open());

        expect(await workspaces.get('user_a', created.id)).toEqual(created);
        expect(await workspaces.list('user_a')).toEqual([first, created]);
    });

    it('keeps a deletion after the database is closed and reopened', async () => {
        const before = open();
        const beforeWorkspaces = createWorkspacesModule(before);
        const first = await beforeWorkspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );
        const deleted = await beforeWorkspaces.create(
            'user_a',
            firstName('Thibaut'),
        );
        const [deletedPage] = (await createPagesModule(before).list(
            'user_a',
            deleted.id,
        ))!;
        await beforeWorkspaces.delete('user_a', deleted.id);
        before.close();

        const db = open();
        const workspaces = createWorkspacesModule(db);
        const pages = createPagesModule(db);

        expect(await workspaces.get('user_a', deleted.id)).toBeNull();
        expect(await workspaces.list('user_a')).toEqual([first]);
        expect(await pages.list('user_a', deleted.id)).toBeNull();
        expect(
            await pages.get('user_a', deleted.id, deletedPage.id),
        ).toBeNull();
    });
});
