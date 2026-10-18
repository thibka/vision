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

function defaultWorkspace(db: Database, userId: string) {
    return createWorkspacesModule(db).getOrCreateDefault(
        userId,
        async () => userId,
    );
}

// No operation creates a second Workspace yet: insert one directly
function secondWorkspace(db: Database, userId: string) {
    const workspace = { id: `second-${userId}`, name: 'Side projects' };
    db.prepare(
        'INSERT INTO workspaces (id, user_id, name, created_at) VALUES (?, ?, ?, ?)',
    ).run(workspace.id, userId, workspace.name, new Date().toISOString());
    return workspace;
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
    it('creates an "Untitled" Page at the root of the Workspace', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');

        const page = await pages.createAtRoot('user_a', workspace.id);

        expect(page).toEqual({
            id: expect.any(String),
            workspaceId: workspace.id,
            parentId: null,
            title: 'Untitled',
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
        expect(await pages.list('user_a', workspace.id)).toHaveLength(2);
    });

    it('returns null for a Workspace that does not exist', async () => {
        const pages = createPagesModule(open());

        expect(await pages.createAtRoot('user_a', 'missing')).toBeNull();
    });

    it("creates nothing in another user's Workspace", async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');

        expect(await pages.createAtRoot('user_b', workspace.id)).toBeNull();
        expect(await pages.list('user_a', workspace.id)).toEqual([]);
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
        const other = secondWorkspace(db, 'user_a');
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
    it('returns an empty list for a Workspace without Pages', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');

        expect(await pages.list('user_a', workspace.id)).toEqual([]);
    });

    it('lists the Pages from the oldest to the most recent', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');

        vi.useFakeTimers({ toFake: ['Date'] });
        // Created out of date order, so the list can't just be the insertion order
        vi.setSystemTime(new Date('2026-01-03'));
        const recent = await pages.createAtRoot('user_a', workspace.id);
        vi.setSystemTime(new Date('2026-01-01'));
        const oldest = await pages.createAtRoot('user_a', workspace.id);
        vi.setSystemTime(new Date('2026-01-02'));
        const middle = await pages.createAtRoot('user_a', workspace.id);

        expect(await pages.list('user_a', workspace.id)).toEqual([
            oldest,
            middle,
            recent,
        ]);
    });

    it('keeps the creation order for Pages created at the same instant', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');

        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-01-01'));
        const created = [];
        for (let i = 0; i < 5; i++) {
            created.push(await pages.createAtRoot('user_a', workspace.id));
        }

        expect(await pages.list('user_a', workspace.id)).toEqual(created);
    });

    it('lists only the Pages of the asked Workspace', async () => {
        const db = open();
        const pages = createPagesModule(db);
        const workspace = await defaultWorkspace(db, 'user_a');
        const other = secondWorkspace(db, 'user_a');
        const page = await pages.createAtRoot('user_a', workspace.id);
        const otherPage = await pages.createAtRoot('user_a', other.id);

        expect(await pages.list('user_a', workspace.id)).toEqual([page]);
        expect(await pages.list('user_a', other.id)).toEqual([otherPage]);
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

describe('persistence', () => {
    it('keeps Pages after the database is closed and reopened', async () => {
        const before = open();
        const workspace = await defaultWorkspace(before, 'user_a');
        const page = await createPagesModule(before).createAtRoot(
            'user_a',
            workspace.id,
        );
        before.close();

        const pages = createPagesModule(open());

        expect(await pages.list('user_a', workspace.id)).toEqual([page]);
        expect(await pages.get('user_a', workspace.id, page!.id)).toEqual(page);
    });
});
