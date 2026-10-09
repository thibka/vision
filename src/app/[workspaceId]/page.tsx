import { loadCurrentWorkspace } from '@/lib/current-workspace';
import { Editor } from "@/components/DynamicEditor";

export default async function WorkspacePage({
    params,
}: PageProps<'/[workspaceId]'>) {
    const { workspaceId } = await params;
    // Layouts don't re-render on navigation, so the page checks access itself
    await loadCurrentWorkspace(workspaceId);

    return (
        <main className="w-4/5" aria-label="Main content">
            <Editor/>
        </main>
    );
}
