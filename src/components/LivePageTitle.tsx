'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Page } from '@/lib/pages';

/** The title being typed in the open Page's title field, normalized as saving would */
type LivePageTitle = { pageId: string; title: string };

const LivePageTitleContext = createContext<{
    liveTitle: LivePageTitle | null;
    setLiveTitle: React.Dispatch<React.SetStateAction<LivePageTitle | null>>;
} | null>(null);

// In the Workspace layout, so the title field and the sidebar share it. Leaving the field or the
// Page keeps it, so the sidebar doesn't flash the old title until the layout is revalidated.
export function LivePageTitleProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [liveTitle, setLiveTitle] = useState<LivePageTitle | null>(null);

    return (
        <LivePageTitleContext value={{ liveTitle, setLiveTitle }}>
            {children}
        </LivePageTitleContext>
    );
}

function useLivePageTitleContext() {
    const context = useContext(LivePageTitleContext);
    if (!context) {
        throw new Error('The live Page title must be used within a LivePageTitleProvider');
    }
    return context;
}

/** For the title field, which publishes the live title on every keystroke. */
export function usePublishLivePageTitle() {
    return useLivePageTitleContext().setLiveTitle;
}

/** The Pages as the sidebar shows them: the live title replaces the server's in its row. */
export function usePagesWithLiveTitle(pages: Page[]) {
    const { liveTitle, setLiveTitle } = useLivePageTitleContext();

    // No longer needed once the server shows the same title, e.g. after the rename's revalidation
    const isSaved =
        liveTitle !== null &&
        pages.some(
            (page) =>
                page.id === liveTitle.pageId && page.title === liveTitle.title,
        );
    useEffect(() => {
        if (!isSaved) return;
        // Only that title: one published since by a keystroke stays
        setLiveTitle((current) => (current === liveTitle ? null : current));
    }, [isSaved, liveTitle, setLiveTitle]);

    if (!liveTitle) return pages;
    return pages.map((page) =>
        page.id === liveTitle.pageId ? { ...page, title: liveTitle.title } : page,
    );
}
