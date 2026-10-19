// Client-side, outlives the editors: a Page left before its Contenu was saved reopens from it
import type { PageContent } from './pages';
import type { SaveScheduler } from './save-scheduler';

const schedulers = new Map<string, SaveScheduler<PageContent>>();

/** The scheduler of a Page left with something unsaved, to go on with when the Page reopens */
export function keptSaveScheduler(pageId: string) {
    return schedulers.get(pageId);
}

/**
 * For the editor leaving a Page: saves what is pending at once, without the navigation waiting
 * for it, and keeps the scheduler until everything is saved.
 */
export function leavePage(
    pageId: string,
    scheduler: SaveScheduler<PageContent>,
) {
    scheduler.saveNow();
    // Already kept when the Page reopened, and still watched until everything is saved
    if (schedulers.get(pageId) === scheduler) return;
    if (!scheduler.hasUnsaved()) return;

    schedulers.set(pageId, scheduler);
    const unsubscribe = scheduler.subscribe(() => {
        if (scheduler.hasUnsaved()) return;
        unsubscribe();
        schedulers.delete(pageId);
    });
}
