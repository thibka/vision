import Avatar from '@/components/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs';
import InputSearch from '@/components/InputSearch';
import { Button } from '@/components/Button';
import { PlusIcon } from "@radix-ui/react-icons"
import ButtonIcon from '@/components/ButtonIcon';

export default function Sidebar() {
    return (
        <aside aria-label="Sidebar" className="flex flex-col w-65 h-full border-r border-sidebar-border bg-sidebar-bg">
            <div className="flex items-center gap-2 mb-4 mt-4 px-4">
                <Avatar>N</Avatar>
                <span className="text-sm font-semibold">Nimbus</span>
            </div>

            <Tabs defaultValue="tab1" className="flex flex-col flex-1 min-h-0">
                <TabsList className="gap-4 px-4">
                    <TabsTrigger value="tab1" className="px-0 py-1">
                        Spaces <span className="text-xs text-text-muted ml-1">1</span>
                    </TabsTrigger>
                    <TabsTrigger value="tab2" className="px-0 py-1">
                        Pages <span className="text-xs text-text-muted ml-1">0</span>
                    </TabsTrigger>
                </TabsList>
                {/* Spaces tab */}
                <TabsContent value="tab1" className="flex flex-col flex-1 min-h-0 justify-between overflow-y-auto">
                    <div className="p-4">
                        <InputSearch placeholder="Filter spaces"/>
                        <p className="text-sm mt-4 text-text-muted">No spaces found.</p>
                    </div>
                    <div className="mt-auto border-t border-sidebar-border pt-4 p-4">
                        <ButtonIcon>Create space</ButtonIcon>
                    </div>
                </TabsContent>
                {/* Pages tab */}
                <TabsContent value="tab2" className="flex flex-col flex-1 min-h-0 justify-between overflow-y-auto">
                    <div className="p-4">
                        <InputSearch placeholder="Filter pages"/>
                        <p className="text-sm mt-4 text-text-muted">No pages found.</p>
                    </div>
                    <div className="mt-auto border-t border-sidebar-border pt-4 p-4">
                        <ButtonIcon>Create page</ButtonIcon>
                    </div>
                </TabsContent>
            </Tabs>
        </aside>
    );
}
