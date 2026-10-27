-- icon is the emoji the user picked for the Workspace's Icône. NULL until one is picked: the avatar then derives it from the name.
ALTER TABLE workspaces ADD COLUMN icon TEXT;
