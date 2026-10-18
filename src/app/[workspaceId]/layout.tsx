import Sidebar from '@/components/Sidebar';
import { loadCurrentWorkspace, loadPages } from '@/lib/current-workspace';
import { createPage } from './actions';

export default async function WorkspaceLayout({
    children,
    params,
}: LayoutProps<'/[workspaceId]'>) {
    const { workspaceId } = await params;
    const workspace = await loadCurrentWorkspace(workspaceId);
    const pages = await loadPages(workspaceId);

    return (
        <div className="flex h-full">
            <Sidebar
                workspaceName={workspace.name}
                pages={pages}
                createPageAction={createPage.bind(null, workspace.id)}
            />
            {children}
        </div>
    );
}
