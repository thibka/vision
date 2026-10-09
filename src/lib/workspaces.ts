import type { Database } from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { getDatabase } from './db';

export type Workspace = {
    id: string;
    name: string;
};

type FirstNameLoader = () => Promise<string | null | undefined>;

function defaultWorkspaceName(firstName: string | null | undefined) {
    const trimmed = firstName?.trim();
    return trimmed ? `${trimmed}'s workspace` : 'Workspace 1';
}

export function createWorkspacesModule(db: Database) {
    const selectFirst = db.prepare<[string], Workspace>(
        'SELECT id, name FROM workspaces WHERE user_id = ? ORDER BY created_at, rowid LIMIT 1',
    );
    const selectOwned = db.prepare<[string, string], Workspace>(
        'SELECT id, name FROM workspaces WHERE user_id = ? AND id = ?',
    );
    const insert = db.prepare(
        'INSERT INTO workspaces (id, user_id, name, created_at) VALUES (?, ?, ?, ?)',
    );

    // Re-reads under the write lock: a concurrent caller may have created it since our first read
    const createDefaultIfNone = db.transaction(
        (userId: string, name: string): Workspace => {
            const existing = selectFirst.get(userId);
            if (existing) return existing;

            const workspace = { id: randomUUID(), name };
            insert.run(
                workspace.id,
                userId,
                workspace.name,
                new Date().toISOString(),
            );
            return workspace;
        },
    );

    return {
        /**
         * Returns the user's first-created Workspace, creating the default one if they have none.
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
