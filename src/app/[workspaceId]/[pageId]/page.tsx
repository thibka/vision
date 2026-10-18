import { Editor } from '@/components/DynamicEditor';
import PageTitle from '@/components/PageTitle';
import { loadPage } from '@/lib/current-workspace';
import { renamePage } from '../actions';

export default async function PageRoute({
    params,
}: PageProps<'/[workspaceId]/[pageId]'>) {
    const { workspaceId, pageId } = await params;
    const page = await loadPage(workspaceId, pageId);

    return (
        <main className="w-4/5" aria-label="Main content">
            {/* Keyed by Page, so the title field starts afresh on each Page */}
            <PageTitle
                key={page.id}
                pageId={page.id}
                title={page.title}
                renameAction={renamePage.bind(null, workspaceId, page.id)}
            />
            <Editor />
        </main>
    );
}
