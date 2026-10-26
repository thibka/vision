import { cookies } from 'next/headers';
import { LivePageTitleProvider } from '@/components/LivePageTitle';
import Sidebar from '@/components/Sidebar';
import {
    loadCurrentWorkspace,
    loadPages,
    loadWorkspaces,
} from '@/lib/current-workspace';
import { SIDEBAR_TAB_COOKIE, parseSidebarTab } from '@/lib/sidebar-tab';
import {
    createPage,
    createWorkspace,
    deletePage,
    deleteWorkspace,
} from './actions';

export default async function WorkspaceLayout({
    children,
    params,
}: LayoutProps<'/[workspaceId]'>) {
    const { workspaceId } = await params;
    const currentWorkspace = await loadCurrentWorkspace(workspaceId);
    const pages = await loadPages(workspaceId);
    const workspaces = await loadWorkspaces();
    const initialTab = parseSidebarTab((await cookies()).get(SIDEBAR_TAB_COOKIE)?.value);

    return (
        <LivePageTitleProvider>
            <div className="flex h-full">
                <Sidebar
                    currentWorkspace={currentWorkspace}
                    workspaces={workspaces}
                    pages={pages}
                    initialTab={initialTab}
                    createPageAction={createPage.bind(null, currentWorkspace.id)}
                    deletePageAction={deletePage.bind(null, currentWorkspace.id)}
                    createWorkspaceAction={createWorkspace}
                    deleteWorkspaceAction={deleteWorkspace}
                />
                {children}
            </div>
        </LivePageTitleProvider>
    );
}
