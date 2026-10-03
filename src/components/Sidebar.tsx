import Avatar from '@/components/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs';

export default function Sidebar() {
    return (
        <aside aria-label="Sidebar" className="w-65 border-r h-full">
            <div className="flex items-center gap-2 mb-4 mt-4 px-4">
                <Avatar>D</Avatar>
                <span className="text-sm font-semibold">Nimbus</span>
            </div>

            <Tabs defaultValue="tab1">
                <TabsList className="gap-4 px-4">
                    <TabsTrigger value="tab1" className="px-0 py-1">Spaces</TabsTrigger>
                    <TabsTrigger value="tab2" className="px-0 py-1">Pages</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">Espaces</TabsContent>
                <TabsContent value="tab2">Pages</TabsContent>
            </Tabs>
        </aside>
    );
}
