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
