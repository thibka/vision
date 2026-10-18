import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { pages } from '@/lib/pages';
import { workspaces } from '@/lib/workspaces';

// Resolves the Workspace of the URL for the signed-in user, or renders the 404.
// Wrapped in `cache` so the layout and the page of one request share a single lookup.
export const loadCurrentWorkspace = cache(async (workspaceId: string) => {
    const { userId } = await auth.protect();
    const workspace = await workspaces().get(userId, workspaceId);
    if (!workspace) notFound();
    return workspace;
});

// Lists the signed-in user's Workspaces, for the Workspaces tab of the sidebar.
export async function loadWorkspaces() {
    const { userId } = await auth.protect();
    return workspaces().list(userId);
}

// Lists the Pages of the Workspace of the URL for the signed-in user, or renders the 404.
export async function loadPages(workspaceId: string) {
    const { userId } = await auth.protect();
    const list = await pages().list(userId, workspaceId);
    if (!list) notFound();
    return list;
}

// Resolves the Page of the URL, or renders the 404 when it isn't a Page of that Workspace.
export async function loadPage(workspaceId: string, pageId: string) {
    const { userId } = await auth.protect();
    const page = await pages().get(userId, workspaceId, pageId);
    if (!page) notFound();
    return page;
}

// Reads the Contenu of the Page of the URL, or renders the 404 when it isn't a Page of that Workspace.
export async function loadPageContent(workspaceId: string, pageId: string) {
    const { userId } = await auth.protect();
    const content = await pages().getContent(userId, workspaceId, pageId);
    if (!content) notFound();
    return content;
}
