import type { Database } from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { getDatabase } from './db';
import { DEFAULT_PAGE_TITLE } from './page-title';

export type Workspace = {
    id: string;
    name: string;
};

type FirstNameLoader = () => Promise<string | null | undefined>;

function defaultWorkspaceName(firstName: string | null | undefined) {
    const trimmed = firstName?.trim();
    return trimmed ? `${trimmed}'s workspace` : 'My workspace';
}

export function createWorkspacesModule(db: Database) {
    const selectFirst = db.prepare<[string], Workspace>(
        'SELECT id, name FROM workspaces WHERE user_id = ? ORDER BY created_at, rowid LIMIT 1',
    );
    const selectAll = db.prepare<[string], Workspace>(
        'SELECT id, name FROM workspaces WHERE user_id = ? ORDER BY created_at, rowid',
    );
    const selectOwned = db.prepare<[string, string], Workspace>(
        'SELECT id, name FROM workspaces WHERE user_id = ? AND id = ?',
    );
    const insert = db.prepare(
        'INSERT INTO workspaces (id, user_id, name, created_at) VALUES (?, ?, ?, ?)',
    );
    const insertInitialPage = db.prepare(
        `INSERT INTO pages (id, workspace_id, parent_id, title, created_at)
         VALUES (?, ?, NULL, ?, ?)`,
    );

    // A Workspace always has at least one Page: it is created with one, in the same transaction
    const insertWorkspaceWithPage = db.transaction(
        (userId: string, name: string): Workspace => {
            const workspace = { id: randomUUID(), name };
            const createdAt = new Date().toISOString();
            insert.run(workspace.id, userId, workspace.name, createdAt);
            insertInitialPage.run(
                randomUUID(),
                workspace.id,
                DEFAULT_PAGE_TITLE,
                createdAt,
            );
            return workspace;
        },
    );

    // Re-reads under the write lock: a concurrent caller may have created it since our first read
    const createDefaultIfNone = db.transaction(
        (userId: string, name: string): Workspace =>
            selectFirst.get(userId) ?? insertWorkspaceWithPage(userId, name),
    );

    return {
        /**
         * Returns the user's first-created Workspace, creating the default one if they have none,
         * with a "New page" Page at its root.
         * `loadFirstName` is only called when a Workspace has to be created: the name is copied
         * once and never follows the profile afterwards.
         */
        async getOrCreateDefault(
            userId: string,
            loadFirstName: FirstNameLoader,
        ): Promise<Workspace> {
            const existing = selectFirst.get(userId);
            if (existing) return existing;

            const name = defaultWorkspaceName(await loadFirstName());
            return createDefaultIfNone.immediate(userId, name);
        },

        /**
         * Always creates a new Workspace with the default name, even if the user already has some,
         * with a "New page" Page at its root. Names are not unique: two Workspaces can share one.
         */
        async create(
            userId: string,
            loadFirstName: FirstNameLoader,
        ): Promise<Workspace> {
            const name = defaultWorkspaceName(await loadFirstName());
            return insertWorkspaceWithPage(userId, name);
        },

        /** Lists the user's Workspaces, oldest first. */
        async list(userId: string): Promise<Workspace[]> {
            return selectAll.all(userId);
        },

        /** Returns null for a missing Workspace and for someone else's, without distinction. */
        async get(
            userId: string,
            workspaceId: string,
        ): Promise<Workspace | null> {
            return selectOwned.get(userId, workspaceId) ?? null;
        },
    };
}

export type Workspaces = ReturnType<typeof createWorkspacesModule>;

let appWorkspaces: Workspaces | undefined;

// The app's instance, on the database file. Tests build their own with `createWorkspacesModule`.
export function workspaces(): Workspaces {
    appWorkspaces ??= createWorkspacesModule(getDatabase());
    return appWorkspaces;
}
