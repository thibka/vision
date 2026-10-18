import { Editor } from '@/components/DynamicEditor';
import PageTitle from '@/components/PageTitle';
import { loadPage, loadPageContent } from '@/lib/current-workspace';
import { renamePage, savePageContent } from '../actions';

export default async function PageRoute({
    params,
}: PageProps<'/[workspaceId]/[pageId]'>) {
    const { workspaceId, pageId } = await params;
    const page = await loadPage(workspaceId, pageId);
    const content = await loadPageContent(workspaceId, page.id);

    return (
        <main className="w-4/5" aria-label="Main content">
            {/* Keyed by Page, so the title field starts afresh on each Page */}
            <PageTitle
                key={page.id}
                pageId={page.id}
                title={page.title}
                renameAction={renamePage.bind(null, workspaceId, page.id)}
            />
            {/* Keyed by Page too, so no Contenu of the previous Page is left in the editor */}
            <Editor
                key={page.id}
                initialContent={content}
                saveAction={savePageContent.bind(null, workspaceId, page.id)}
            />
        </main>
    );
}
