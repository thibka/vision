import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { workspaces } from '@/lib/workspaces';

// Resolves the Workspace of the URL for the signed-in user, or renders the 404.
// Wrapped in `cache` so the layout and the page of one request share a single lookup.
export const loadCurrentWorkspace = cache(async (workspaceId: string) => {
    const { userId } = await auth.protect();
    const workspace = await workspaces().get(userId, workspaceId);
    if (!workspace) notFound();
    return workspace;
});
