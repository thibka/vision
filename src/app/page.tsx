import SideBar from '@/components/Sidebar';

export default function Home() {
    return (
        <div className="flex h-full">
            <SideBar />
            <main className="w-4/5 p-12" aria-label="Main content">
                <p className="text-2xl">Hello</p>
            </main>
        </div>
    );
}
