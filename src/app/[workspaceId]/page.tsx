import { redirect } from 'next/navigation';
import { loadPages } from '@/lib/current-workspace';

export default async function WorkspacePage({
    params,
}: PageProps<'/[workspaceId]'>) {
    const { workspaceId } = await params;
    // Layouts don't re-render on navigation, so the page checks access itself
    const [oldest] = await loadPages(workspaceId);

    // A Workspace always has at least one Page: opening it shows its oldest one
    redirect(`/${workspaceId}/${oldest.id}`);
}
