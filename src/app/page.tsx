import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { workspaces } from '@/lib/workspaces';

export default async function Home() {
    const { userId } = await auth.protect();
    const workspace = await workspaces().getOrCreateDefault(
        userId,
        async () => (await currentUser())?.firstName,
    );

    redirect(`/${workspace.id}`);
}
