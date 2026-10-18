import Sidebar from '@/components/Sidebar';
import {
    loadCurrentWorkspace,
    loadPages,
    loadWorkspaces,
} from '@/lib/current-workspace';
import { createPage } from './actions';

export default async function WorkspaceLayout({
    children,
    params,
}: LayoutProps<'/[workspaceId]'>) {
    const { workspaceId } = await params;
    const currentWorkspace = await loadCurrentWorkspace(workspaceId);
    const pages = await loadPages(workspaceId);
    const workspaces = await loadWorkspaces();

    return (
        <div className="flex h-full">
            <Sidebar
                currentWorkspace={currentWorkspace}
                workspaces={workspaces}
                pages={pages}
                createPageAction={createPage.bind(null, currentWorkspace.id)}
            />
            {children}
        </div>
    );
}
