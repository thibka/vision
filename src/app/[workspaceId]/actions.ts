'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { pages } from '@/lib/pages';

export async function createPage(workspaceId: string) {
    const { userId } = await auth.protect();
    const page = await pages().createAtRoot(userId, workspaceId);
    if (!page) notFound();

    // The sidebar lives in the layout, which a navigation alone would not re-render
    revalidatePath('/[workspaceId]', 'layout');
    redirect(`/${workspaceId}/${page.id}`);
}
