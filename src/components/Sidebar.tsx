import Avatar from '@/components/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs';
import SidebarPages from '@/components/SidebarPages';
import SidebarWorkspaces from '@/components/SidebarWorkspaces';
import { UserButton } from '@clerk/nextjs';
import type { Page } from '@/lib/pages';
import type { Workspace } from '@/lib/workspaces';

export default function Sidebar({
    currentWorkspace,
    workspaces,
    pages,
    createPageAction,
}: {
    currentWorkspace: Workspace;
    workspaces: Workspace[];
    pages: Page[];
    createPageAction: () => Promise<void>;
}) {
    return (
        <aside aria-label="Sidebar" className="flex flex-col w-65 h-full border-r border-sidebar-border bg-sidebar-bg">
            <div className="flex items-center gap-2 mb-4 mt-4 px-4">
                <Avatar>{currentWorkspace.name.charAt(0).toUpperCase()}</Avatar>
                <span className="text-sm font-semibold truncate min-w-0">{currentWorkspace.name}</span>
                <div className="ml-auto flex items-center">
                    <UserButton />
                </div>
            </div>

            <Tabs defaultValue="pages" className="flex flex-col flex-1 min-h-0">
                <TabsList className="gap-4 px-4">
                    <TabsTrigger value="workspaces" className="px-0 py-1">
                        Workspaces <span className="text-xs text-text-muted ml-1">{workspaces.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="pages" className="px-0 py-1">
                        Pages <span className="text-xs text-text-muted ml-1">{pages.length}</span>
                    </TabsTrigger>
                </TabsList>
                {/* Workspaces tab */}
                <TabsContent value="workspaces" className="flex flex-col flex-1 min-h-0 justify-between overflow-y-auto">
                    <SidebarWorkspaces workspaces={workspaces} currentWorkspaceId={currentWorkspace.id} />
                </TabsContent>
                {/* Pages tab */}
                <TabsContent value="pages" className="flex flex-col flex-1 min-h-0 justify-between overflow-y-auto">
                    <SidebarPages pages={pages} createPageAction={createPageAction} />
                </TabsContent>
            </Tabs>
        </aside>
    );
}
