-- No uniqueness on user_id: a user can own several Workspaces.
CREATE TABLE workspaces (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
) STRICT;

CREATE INDEX workspaces_user_id ON workspaces (user_id);
