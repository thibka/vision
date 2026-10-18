'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { pages } from '@/lib/pages';
import { workspaces } from '@/lib/workspaces';

export async function createPage(workspaceId: string) {
    const { userId } = await auth.protect();
    const page = await pages().createAtRoot(userId, workspaceId);
    if (!page) notFound();

    // The sidebar lives in the layout, which a navigation alone would not re-render
    revalidatePath('/[workspaceId]', 'layout');
    redirect(`/${workspaceId}/${page.id}`);
}

export async function renamePage(
    workspaceId: string,
    pageId: string,
    title: string,
) {
    const { userId } = await auth.protect();
    const page = await pages().rename(userId, workspaceId, pageId, title);
    if (!page) notFound();

    // The sidebar lives in the layout, which a navigation alone would not re-render
    revalidatePath('/[workspaceId]', 'layout');
}

// `isOpen` comes from the client, but it only decides where to land: the delete still checks access
export async function deletePage(
    workspaceId: string,
    pageId: string,
    isOpen: boolean,
) {
    const { userId } = await auth.protect();
    // False for a Page already deleted, e.g. from another tab: there is nothing left to do
    await pages().delete(userId, workspaceId, pageId);

    // The sidebar lives in the layout, which a navigation alone would not re-render
    revalidatePath('/[workspaceId]', 'layout');
    // The Workspace route leads to its oldest Page, possibly the "New page" that replaced the last one
    if (isOpen) redirect(`/${workspaceId}`);
}

// Takes nothing from the client: the Workspace is always created for the signed-in user
export async function createWorkspace() {
    const { userId } = await auth.protect();
    const workspace = await workspaces().create(
        userId,
        async () => (await currentUser())?.firstName,
    );

    // The sidebar lives in the layout, which a navigation alone would not re-render
    revalidatePath('/[workspaceId]', 'layout');
    redirect(`/${workspace.id}`);
}
