import SideBar from '@/app/components/sidebar';

export default function Home() {
    return (
        <div className="flex h-full">
            <SideBar />
            <main className="w-4/5" aria-label="Main content">
                page 1
            </main>
        </div>
    );
}
