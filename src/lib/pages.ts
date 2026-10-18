import type { Database } from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { getDatabase } from './db';

export type Page = {
    id: string;
    workspaceId: string;
    /** null for a Page at the root of its Workspace */
    parentId: string | null;
    title: string;
};

const DEFAULT_TITLE = 'Untitled';

export function createPagesModule(db: Database) {
    const ownsWorkspace = db
        .prepare<
            [string, string],
            number
        >('SELECT 1 FROM workspaces WHERE user_id = ? AND id = ?')
        .pluck();
    // Inserts nothing unless the Workspace belongs to the user: the check and the write are one statement
    const insertAtRoot = db.prepare(
        `INSERT INTO pages (id, workspace_id, parent_id, title, created_at)
         SELECT ?, id, NULL, ?, ? FROM workspaces WHERE user_id = ? AND id = ?`,
    );
    const selectOwned = db.prepare<[string, string, string], Page>(
        `SELECT p.id, p.workspace_id AS workspaceId, p.parent_id AS parentId, p.title
         FROM pages p JOIN workspaces w ON w.id = p.workspace_id
         WHERE w.user_id = ? AND p.workspace_id = ? AND p.id = ?`,
    );
    const selectByWorkspace = db.prepare<[string], Page>(
        `SELECT id, workspace_id AS workspaceId, parent_id AS parentId, title
         FROM pages WHERE workspace_id = ? ORDER BY created_at, rowid`,
    );

    return {
        /**
         * Creates an "Untitled" Page at the root of the Workspace.
         * Returns null for a missing Workspace and for someone else's, without distinction.
         */
        async createAtRoot(
            userId: string,
            workspaceId: string,
        ): Promise<Page | null> {
            const page: Page = {
                id: randomUUID(),
                workspaceId,
                parentId: null,
                title: DEFAULT_TITLE,
            };
            const { changes } = insertAtRoot.run(
                page.id,
                page.title,
                new Date().toISOString(),
                userId,
                workspaceId,
            );
            return changes === 1 ? page : null;
        },

        /**
         * Returns null for a missing Page, for a Page of another Workspace than `workspaceId`,
         * and for someone else's Workspace, without distinction.
         */
        async get(
            userId: string,
            workspaceId: string,
            pageId: string,
        ): Promise<Page | null> {
            return selectOwned.get(userId, workspaceId, pageId) ?? null;
        },

        /**
         * Lists the Pages of the Workspace, oldest first.
         * Returns null for a missing Workspace and for someone else's, without distinction.
         */
        async list(userId: string, workspaceId: string): Promise<Page[] | null> {
            if (!ownsWorkspace.get(userId, workspaceId)) return null;
            return selectByWorkspace.all(workspaceId);
        },
    };
}

export type Pages = ReturnType<typeof createPagesModule>;

let appPages: Pages | undefined;

// The app's instance, on the database file. Tests build their own with `createPagesModule`.
export function pages(): Pages {
    appPages ??= createPagesModule(getDatabase());
    return appPages;
}
