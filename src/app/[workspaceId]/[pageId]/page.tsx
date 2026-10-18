import { Editor } from '@/components/DynamicEditor';
import { loadPage } from '@/lib/current-workspace';

export default async function PageRoute({
    params,
}: PageProps<'/[workspaceId]/[pageId]'>) {
    const { workspaceId, pageId } = await params;
    const page = await loadPage(workspaceId, pageId);

    return (
        <main className="w-4/5" aria-label="Main content">
            <h1 className="px-12 py-10 text-4xl font-bold">{page.title}</h1>
            <Editor />
        </main>
    );
}
