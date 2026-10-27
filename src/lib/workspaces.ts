import type { Database } from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { getDatabase } from './db';
import { DEFAULT_PAGE_TITLE } from './page-title';
import {
    MAX_WORKSPACE_NAME_LENGTH,
    isEmoji,
    truncateWorkspaceName,
    workspaceNameLength,
} from './workspace-name';

export type Workspace = {
    id: string;
    name: string;
    /** The emoji picked by the user, null while the Icône is derived from the name */
    icon: string | null;
};

type FirstNameLoader = () => Promise<string | null | undefined>;

function defaultWorkspaceName(firstName: string | null | undefined) {
    const trimmed = firstName?.trim();
    // A long first name must not push the Nom par défaut past the limit of a name
    return truncateWorkspaceName(
        trimmed ? `${trimmed}'s workspace` : 'My workspace',
    );
}

export function createWorkspacesModule(db: Database) {
    const selectFirst = db.prepare<[string], Workspace>(
        'SELECT id, name, icon FROM workspaces WHERE user_id = ? ORDER BY created_at, rowid LIMIT 1',
    );
    const selectAll = db.prepare<[string], Workspace>(
        'SELECT id, name, icon FROM workspaces WHERE user_id = ? ORDER BY created_at, rowid',
    );
    const selectOwned = db.prepare<[string, string], Workspace>(
        'SELECT id, name, icon FROM workspaces WHERE user_id = ? AND id = ?',
    );
    const insert = db.prepare(
        'INSERT INTO workspaces (id, user_id, name, created_at) VALUES (?, ?, ?, ?)',
    );
    const insertInitialPage = db.prepare(
        `INSERT INTO pages (id, workspace_id, parent_id, title, created_at)
         VALUES (?, ?, NULL, ?, ?)`,
    );
    const hasOther = db
        .prepare<
            [string, string],
            number
        >('SELECT 1 FROM workspaces WHERE user_id = ? AND id <> ? LIMIT 1')
        .pluck();
    const updateOwned = db.prepare(
        'UPDATE workspaces SET name = ?, icon = ? WHERE id = ? AND user_id = ?',
    );
    // One statement: the parent_id foreign key of Sous-pages is checked at its end, whatever the row order
    const deletePages = db.prepare('DELETE FROM pages WHERE workspace_id = ?');
    const deleteOwned = db.prepare(
        'DELETE FROM workspaces WHERE id = ? AND user_id = ?',
    );

    // A Workspace always has at least one Page: it is created with one, in the same transaction
    const insertWorkspaceWithPage = db.transaction(
        (userId: string, name: string): Workspace => {
            const workspace = { id: randomUUID(), name, icon: null };
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

    // A user always has at least one Workspace: checked under the write lock, so two concurrent
    // deletes can't remove the last two
    const deleteUnlessLast = db.transaction(
        (userId: string, workspaceId: string): boolean => {
            if (!selectOwned.get(userId, workspaceId)) return false;
            if (!hasOther.get(userId, workspaceId)) return false;

            deletePages.run(workspaceId);
            deleteOwned.run(workspaceId, userId);
            return true;
        },
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

        /**
         * Sets the name and the picked emoji of the Workspace together; a null `icon` goes back to the
         * Icône derived from the name. Returns null for a missing Workspace and for someone else's,
         * without distinction.
         * Throws when the trimmed name is empty or longer than `MAX_WORKSPACE_NAME_LENGTH` characters,
         * or when `icon` is not exactly one emoji.
         */
        async update(
            userId: string,
            workspaceId: string,
            { name, icon }: { name: string; icon: string | null },
        ): Promise<Workspace | null> {
            const trimmed = name.trim();
            if (!trimmed) {
                throw new Error('A Workspace name cannot be empty');
            }
            if (workspaceNameLength(trimmed) > MAX_WORKSPACE_NAME_LENGTH) {
                throw new Error(
                    `A Workspace name cannot be longer than ${MAX_WORKSPACE_NAME_LENGTH} characters`,
                );
            }
            if (icon !== null && !isEmoji(icon)) {
                throw new Error('A Workspace icon must be exactly one emoji');
            }
            const { changes } = updateOwned.run(
                trimmed,
                icon,
                workspaceId,
                userId,
            );
            if (changes === 0) return null;
            return selectOwned.get(userId, workspaceId) ?? null;
        },

        /**
         * Deletes the Workspace and all its Pages for good, as long as the user has another one.
         * Returns false for a missing Workspace, for someone else's and for the user's last one,
         * without distinction.
         */
        async delete(userId: string, workspaceId: string): Promise<boolean> {
            return deleteUnlessLast.immediate(userId, workspaceId);
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
