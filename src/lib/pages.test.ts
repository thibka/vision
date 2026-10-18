import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Database } from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openDatabase } from './db';
import { createPagesModule, type Page } from './pages';
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

function defaultWorkspace(db: Database, userId: string) {
    return createWorkspacesModule(db).getOrCreateDefault(
        userId,
        async () => userId,
    );
}

function secondWorkspace(db: Database, userId: string) {
    return createWorkspacesModule(db).create(userId, async () => userId);
}

// The "New page" Page every Workspace is created with
async function initialPage(db: Database, userId: string, workspaceId: string) {
    const [initial] = (await createPagesModule(db).list(userId, workspaceId))!;
    return initial;
}

beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'vision-test-'));
    file = path.join(dir, 'test.db');
    opened = [];
});

afterEach(() => {
    vi.useRealTimers();
    for (const db of opened) db.close();
    rmSync(dir, { recursive: true, force: true });
});

describe('createAtRoot', () => {
    it('creates a "New page" Page at the root of the Workspace', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');

        const page = await pages.createAtRoot('user_a', workspace.id);

        expect(page).toEqual({
            id: expect.any(String),
            workspaceId: workspace.id,
            parentId: null,
            title: 'New page',
        });
        expect(await pages.get('user_a', workspace.id, page!.id)).toEqual(page);
    });

    it('creates a new Page on each call', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');

        const first = await pages.createAtRoot('user_a', workspace.id);
        const second = await pages.createAtRoot('user_a', workspace.id);

        expect(second!.id).not.toBe(first!.id);
        // Plus the initial Page
        expect(await pages.list('user_a', workspace.id)).toHaveLength(3);
    });

    it('returns null for a Workspace that does not exist', async () => {
        const pages = createPagesModule(open());

        expect(await pages.createAtRoot('user_a', 'missing')).toBeNull();
    });

    it("creates nothing in another user's Workspace", async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');

        const initial = await initialPage(db, 'user_a', workspace.id);

        expect(await pages.createAtRoot('user_b', workspace.id)).toBeNull();
        expect(await pages.list('user_a', workspace.id)).toEqual([initial]);
    });
});

describe('get', () => {
    it('returns null for a Page that does not exist', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');

        expect(await pages.get('user_a', workspace.id, 'missing')).toBeNull();
    });

    it("returns null for a Page in another user's Workspace", async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const page = await pages.createAtRoot('user_a', workspace.id);

        expect(await pages.get('user_b', workspace.id, page!.id)).toBeNull();
    });

    it('returns null for a Page asked with the wrong Workspace', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const other = await secondWorkspace(db, 'user_a');
        const page = await pages.createAtRoot('user_a', workspace.id);

        expect(await pages.get('user_a', other.id, page!.id)).toBeNull();
        expect(await pages.get('user_a', workspace.id, page!.id)).toEqual(page);
    });

    it("returns null when another user asks for the Page with their own Workspace", async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspaceA = await defaultWorkspace(db, 'user_a');
        const workspaceB = await defaultWorkspace(db, 'user_b');
        const page = await pages.createAtRoot('user_a', workspaceA.id);

        expect(await pages.get('user_b', workspaceB.id, page!.id)).toBeNull();
    });
});

describe('list', () => {
    it('lists the initial "New page" Page of a fresh Workspace', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');

        expect(await pages.list('user_a', workspace.id)).toEqual([
            {
                id: expect.any(String),
                workspaceId: workspace.id,
                parentId: null,
                title: 'New page',
            },
        ]);
    });

    it('lists the Pages from the oldest to the most recent', async () => {
        const db = open();
        const pages = createPagesModule(db);

        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-01-01'));
        const workspace = await defaultWorkspace(db, 'user_a');
        const initial = await initialPage(db, 'user_a', workspace.id);
        // Created out of date order, so the list can't just be the insertion order
        vi.setSystemTime(new Date('2026-01-04'));
        const recent = await pages.createAtRoot('user_a', workspace.id);
        vi.setSystemTime(new Date('2026-01-02'));
        const oldest = await pages.createAtRoot('user_a', workspace.id);
        vi.setSystemTime(new Date('2026-01-03'));
        const middle = await pages.createAtRoot('user_a', workspace.id);

        expect(await pages.list('user_a', workspace.id)).toEqual([
            initial,
            oldest,
            middle,
            recent,
        ]);
    });

    it('keeps the creation order for Pages created at the same instant', async () => {
        const db = open();
        const pages = createPagesModule(db);

        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-01-01'));
        const workspace = await defaultWorkspace(db, 'user_a');
        const created: (Page | null)[] = [
            await initialPage(db, 'user_a', workspace.id),
        ];
        for (let i = 0; i < 5; i++) {
            created.push(await pages.createAtRoot('user_a', workspace.id));
        }

        expect(await pages.list('user_a', workspace.id)).toEqual(created);
    });

    it('lists only the Pages of the asked Workspace', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const other = await secondWorkspace(db, 'user_a');
        const initial = await initialPage(db, 'user_a', workspace.id);
        const otherInitial = await initialPage(db, 'user_a', other.id);
        const page = await pages.createAtRoot('user_a', workspace.id);
        const otherPage = await pages.createAtRoot('user_a', other.id);

        expect(await pages.list('user_a', workspace.id)).toEqual([initial, page]);
        expect(await pages.list('user_a', other.id)).toEqual([
            otherInitial,
            otherPage,
        ]);
    });

    it('returns null for a Workspace that does not exist', async () => {
        const pages = createPagesModule(open());

        expect(await pages.list('user_a', 'missing')).toBeNull();
    });

    it("returns null for another user's Workspace", async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        await pages.createAtRoot('user_a', workspace.id);

        expect(await pages.list('user_b', workspace.id)).toBeNull();
    });
});

describe('rename', () => {
    it('returns the renamed Page, and get and list show the new title', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const page = await pages.createAtRoot('user_a', workspace.id);

        const renamed = await pages.rename(
            'user_a',
            workspace.id,
            page!.id,
            'Roadmap',
        );

        expect(renamed).toEqual({ ...page, title: 'Roadmap' });
        expect(await pages.get('user_a', workspace.id, page!.id)).toEqual(renamed);
        expect(await pages.list('user_a', workspace.id)).toContainEqual(renamed);
    });

    it('renames only the asked Page', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const initial = await initialPage(db, 'user_a', workspace.id);
        const page = await pages.createAtRoot('user_a', workspace.id);

        await pages.rename('user_a', workspace.id, page!.id, 'Roadmap');

        expect(await pages.list('user_a', workspace.id)).toEqual([
            initial,
            { ...page, title: 'Roadmap' },
        ]);
    });

    it('trims the spaces around the title', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const page = await initialPage(db, 'user_a', workspace.id);

        const renamed = await pages.rename(
            'user_a',
            workspace.id,
            page.id,
            '  Road  map \t',
        );

        expect(renamed!.title).toBe('Road  map');
    });

    it.each(['', '   '])(
        'gives the "New page" title back for an empty title (%j)',
        async (title) => {
            const db = open();
            const pages = createPagesModule(db);
            const workspace = await defaultWorkspace(db, 'user_a');
            const page = await initialPage(db, 'user_a', workspace.id);
            await pages.rename('user_a', workspace.id, page.id, 'Roadmap');

            const renamed = await pages.rename(
                'user_a',
                workspace.id,
                page.id,
                title,
            );

            expect(renamed!.title).toBe('New page');
            expect(
                (await pages.get('user_a', workspace.id, page.id))!.title,
            ).toBe('New page');
        },
    );

    it('accepts a title of 200 characters, counted in characters', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const page = await initialPage(db, 'user_a', workspace.id);
        // 200 characters, but 400 UTF-16 units and 800 bytes
        const title = '😀'.repeat(200);

        const renamed = await pages.rename('user_a', workspace.id, page.id, title);

        expect(renamed!.title).toBe(title);
    });

    it('accepts a title that is 200 characters once trimmed', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const page = await initialPage(db, 'user_a', workspace.id);

        const renamed = await pages.rename(
            'user_a',
            workspace.id,
            page.id,
            ` ${'a'.repeat(200)} `,
        );

        expect(renamed!.title).toBe('a'.repeat(200));
    });

    it('throws for a title of 201 characters, and leaves the title unchanged', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const page = await initialPage(db, 'user_a', workspace.id);

        await expect(
            pages.rename('user_a', workspace.id, page.id, 'a'.repeat(201)),
        ).rejects.toThrow();
        expect(await pages.get('user_a', workspace.id, page.id)).toEqual(page);
    });

    it('returns null for a Page that does not exist', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const initial = await initialPage(db, 'user_a', workspace.id);

        expect(
            await pages.rename('user_a', workspace.id, 'missing', 'Roadmap'),
        ).toBeNull();
        expect(await pages.list('user_a', workspace.id)).toEqual([initial]);
    });

    it('returns null for a Page asked with the wrong Workspace, without renaming it', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const other = await secondWorkspace(db, 'user_a');
        const page = await initialPage(db, 'user_a', workspace.id);

        expect(
            await pages.rename('user_a', other.id, page.id, 'Roadmap'),
        ).toBeNull();
        expect(await pages.get('user_a', workspace.id, page.id)).toEqual(page);
    });

    it("returns null for a Page in another user's Workspace, without renaming it", async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const page = await initialPage(db, 'user_a', workspace.id);

        expect(
            await pages.rename('user_b', workspace.id, page.id, 'Roadmap'),
        ).toBeNull();
        expect(await pages.get('user_a', workspace.id, page.id)).toEqual(page);
    });

    it('returns null when another user renames the Page with their own Workspace', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspaceA = await defaultWorkspace(db, 'user_a');
        const workspaceB = await defaultWorkspace(db, 'user_b');
        const page = await initialPage(db, 'user_a', workspaceA.id);

        expect(
            await pages.rename('user_b', workspaceB.id, page.id, 'Roadmap'),
        ).toBeNull();
        expect(await pages.get('user_a', workspaceA.id, page.id)).toEqual(page);
    });
});

describe('delete', () => {
    it('returns true, and the Page is gone from list and get', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const initial = await initialPage(db, 'user_a', workspace.id);
        const page = await pages.createAtRoot('user_a', workspace.id);

        expect(await pages.delete('user_a', workspace.id, page!.id)).toBe(true);
        expect(await pages.get('user_a', workspace.id, page!.id)).toBeNull();
        expect(await pages.list('user_a', workspace.id)).toEqual([initial]);
    });

    it('creates nothing when other Pages are left', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const initial = await initialPage(db, 'user_a', workspace.id);
        const first = await pages.createAtRoot('user_a', workspace.id);
        const second = await pages.createAtRoot('user_a', workspace.id);

        await pages.delete('user_a', workspace.id, first!.id);

        expect(await pages.list('user_a', workspace.id)).toEqual([
            initial,
            second,
        ]);
    });

    it('replaces the last Page with exactly one other "New page" Page', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const page = await initialPage(db, 'user_a', workspace.id);
        await pages.rename('user_a', workspace.id, page.id, 'Roadmap');

        expect(await pages.delete('user_a', workspace.id, page.id)).toBe(true);

        const list = await pages.list('user_a', workspace.id);
        expect(list).toEqual([
            {
                id: expect.any(String),
                workspaceId: workspace.id,
                parentId: null,
                title: 'New page',
            },
        ]);
        expect(list![0].id).not.toBe(page.id);
    });

    it('returns false for a Page already deleted, and creates nothing', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const initial = await initialPage(db, 'user_a', workspace.id);
        const page = await pages.createAtRoot('user_a', workspace.id);
        await pages.delete('user_a', workspace.id, page!.id);

        expect(await pages.delete('user_a', workspace.id, page!.id)).toBe(false);
        expect(await pages.list('user_a', workspace.id)).toEqual([initial]);
    });

    it('returns false for a Page that does not exist, and deletes nothing', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const initial = await initialPage(db, 'user_a', workspace.id);

        expect(await pages.delete('user_a', workspace.id, 'missing')).toBe(false);
        expect(await pages.list('user_a', workspace.id)).toEqual([initial]);
    });

    it('returns false for a Page asked with the wrong Workspace, without deleting or creating', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const other = await secondWorkspace(db, 'user_a');
        const page = await initialPage(db, 'user_a', workspace.id);
        const otherInitial = await initialPage(db, 'user_a', other.id);

        expect(await pages.delete('user_a', other.id, page.id)).toBe(false);
        expect(await pages.list('user_a', workspace.id)).toEqual([page]);
        expect(await pages.list('user_a', other.id)).toEqual([otherInitial]);
    });

    it("returns false for a Page in another user's Workspace, without deleting or creating", async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const page = await initialPage(db, 'user_a', workspace.id);

        expect(await pages.delete('user_b', workspace.id, page.id)).toBe(false);
        expect(await pages.list('user_a', workspace.id)).toEqual([page]);
    });

    it('returns false when another user deletes the Page with their own Workspace', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspaceA = await defaultWorkspace(db, 'user_a');
        const workspaceB = await defaultWorkspace(db, 'user_b');
        const page = await initialPage(db, 'user_a', workspaceA.id);
        const pageB = await initialPage(db, 'user_b', workspaceB.id);

        expect(await pages.delete('user_b', workspaceB.id, page.id)).toBe(false);
        expect(await pages.list('user_a', workspaceA.id)).toEqual([page]);
        expect(await pages.list('user_b', workspaceB.id)).toEqual([pageB]);
    });
});

describe('persistence', () => {
    it('keeps Pages after the database is closed and reopened', async () => {
        const before = open();
        const workspace = await defaultWorkspace(before, 'user_a');
        const initial = await initialPage(before, 'user_a', workspace.id);
        const page = await createPagesModule(before).createAtRoot(
            'user_a',
            workspace.id,
        );
        before.close();

        const pages = createPagesModule(open());

        expect(await pages.list('user_a', workspace.id)).toEqual([initial, page]);
        expect(await pages.get('user_a', workspace.id, page!.id)).toEqual(page);
    });

    it('keeps a new title after the database is closed and reopened', async () => {
        const before = open();
        const workspace = await defaultWorkspace(before, 'user_a');
        const page = await initialPage(before, 'user_a', workspace.id);
        const renamed = await createPagesModule(before).rename(
            'user_a',
            workspace.id,
            page.id,
            'Roadmap',
        );
        before.close();

        const pages = createPagesModule(open());

        expect(await pages.get('user_a', workspace.id, page.id)).toEqual(renamed);
        expect(await pages.list('user_a', workspace.id)).toEqual([renamed]);
    });

    it('keeps a deletion after the database is closed and reopened', async () => {
        const before = open();
        const workspace = await defaultWorkspace(before, 'user_a');
        const initial = await initialPage(before, 'user_a', workspace.id);
        const page = await createPagesModule(before).createAtRoot(
            'user_a',
            workspace.id,
        );
        await createPagesModule(before).delete('user_a', workspace.id, page!.id);
        before.close();

        const pages = createPagesModule(open());

        expect(await pages.get('user_a', workspace.id, page!.id)).toBeNull();
        expect(await pages.list('user_a', workspace.id)).toEqual([initial]);
    });

    it('keeps the "New page" Page that replaced the last one after the database is closed and reopened', async () => {
        const before = open();
        const workspace = await defaultWorkspace(before, 'user_a');
        const initial = await initialPage(before, 'user_a', workspace.id);
        await createPagesModule(before).delete('user_a', workspace.id, initial.id);
        const replacement = await initialPage(before, 'user_a', workspace.id);
        before.close();

        const pages = createPagesModule(open());

        expect(await pages.list('user_a', workspace.id)).toEqual([replacement]);
        expect(replacement.id).not.toBe(initial.id);
    });
});
