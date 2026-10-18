-- parent_id is NULL for a Page at the root of its Workspace; a Sous-page will point to its parent Page.
CREATE TABLE pages (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces (id),
    parent_id TEXT REFERENCES pages (id),
    title TEXT NOT NULL,
    created_at TEXT NOT NULL
) STRICT;

CREATE INDEX pages_workspace_id_created_at ON pages (workspace_id, created_at);
