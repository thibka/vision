import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Database } from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openDatabase } from './db';
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
    ])('names it "Workspace 1" for a/an %s first name', async (_, value) => {
        const workspaces = createWorkspacesModule(open());

        const workspace = await workspaces.getOrCreateDefault(
            'user_a',
            firstName(value),
        );

        expect(workspace.name).toBe('Workspace 1');
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

    it('returns the first-created Workspace when the user has several', async () => {
        const db = open();
        const workspaces = createWorkspacesModule(db);
        const recent = await workspaces.getOrCreateDefault(
            'user_a',
            firstName('Thibaut'),
        );
        // No operation creates a second Workspace yet: insert one directly, dated before the other
        db.prepare(
            'INSERT INTO workspaces (id, user_id, name, created_at) VALUES (?, ?, ?, ?)',
        ).run('older', 'user_a', 'Side projects', '2020-01-01T00:00:00.000Z');
        const older = { id: 'older', name: 'Side projects' };

        expect(await workspaces.get('user_a', 'older')).toEqual(older);
        expect(await workspaces.get('user_a', recent.id)).toEqual(recent);
        expect(
            await workspaces.getOrCreateDefault('user_a', firstName('Thibaut')),
        ).toEqual(older);
        expect(countWorkspaces(db, 'user_a')).toBe(2);
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
});
