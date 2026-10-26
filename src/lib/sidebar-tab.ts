export const SIDEBAR_TAB_COOKIE = 'sidebar-tab';

export const SIDEBAR_TABS = ['workspaces', 'pages'] as const;
export type SidebarTab = (typeof SIDEBAR_TABS)[number];

const DEFAULT_SIDEBAR_TAB: SidebarTab = 'pages';

// Reads the remembered sidebar tab, falling back to Pages when absent or unknown.
export function parseSidebarTab(value: string | undefined): SidebarTab {
    return SIDEBAR_TABS.find((tab) => tab === value) ?? DEFAULT_SIDEBAR_TAB;
}
