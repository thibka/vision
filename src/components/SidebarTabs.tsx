'use client';

import type { ReactNode } from 'react';
import { Tabs } from '@/components/Tabs';
import { SIDEBAR_TAB_COOKIE, parseSidebarTab, type SidebarTab } from '@/lib/sidebar-tab';

const ONE_YEAR = 60 * 60 * 24 * 365;

// Tabs of the sidebar that remember the last selected tab in a cookie,
// so the server renders it already selected on the next load.
export default function SidebarTabs({
    initialTab,
    children,
}: {
    initialTab: SidebarTab;
    children: ReactNode;
}) {
    return (
        <Tabs
            defaultValue={initialTab}
            onValueChange={(value) => {
                document.cookie = `${SIDEBAR_TAB_COOKIE}=${parseSidebarTab(value)}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
            }}
            className="flex flex-col flex-1 min-h-0"
        >
            {children}
        </Tabs>
    );
}
