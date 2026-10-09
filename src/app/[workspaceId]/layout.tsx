import Sidebar from '@/components/Sidebar';
import { loadCurrentWorkspace } from '@/lib/current-workspace';

export default async function WorkspaceLayout({
    children,
    params,
}: LayoutProps<'/[workspaceId]'>) {
    const { workspaceId } = await params;
    const workspace = await loadCurrentWorkspace(workspaceId);

    return (
        <div className="flex h-full">
            <Sidebar workspaceName={workspace.name} />
            {children}
        </div>
    );
}
