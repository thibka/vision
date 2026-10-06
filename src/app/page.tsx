import { auth } from '@clerk/nextjs/server';
import SideBar from '@/components/Sidebar';

export default async function Home() {
    await auth.protect();

    return (
        <div className="flex h-full">
            <SideBar />
            <main className="w-4/5 p-12" aria-label="Main content">
                <p className="text-2xl">Hello</p>
            </main>
        </div>
    );
}
