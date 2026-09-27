import { Button } from "@headlessui/react";

export default function Sidebar() {
    return (
        <aside aria-label="Sidebar" className="w-1/5 border-r h-full">
            <nav>
                <ul className="flex flex-col p-4 gap-4">
                    <Button className="rounded bg-sky-600 px-4 py-2 text-sm text-white data-active:bg-sky-700 data-hover:bg-sky-500">
                        Espace 1
                    </Button>
                    <Button className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700">
                        Espace 2
                    </Button>
                </ul>
            </nav>  
        </aside>
    );
}
