// Client-side, outlives the editors: a Page left before its Contenu was saved reopens from it
import type { PageContent } from './pages';
import { createSaveScheduler, type SaveScheduler } from './save-scheduler';

const SAVE_DELAY_MS = 1000;

const schedulers = new Map<string, SaveScheduler<PageContent>>();

/**
 * The scheduler for the editor opening a Page. A Page left before its save ended goes on with the
 * same scheduler, so its later changes are saved after that save, and its `latest` Contenu is the
 * one typed rather than the server's.
 */
export function pageSaveScheduler(
    pageId: string,
    save: (content: PageContent) => Promise<unknown>,
) {
    const kept = schedulers.get(pageId);
    if (kept) return kept;

    const scheduler = createSaveScheduler(save, SAVE_DELAY_MS);
    saveOnUnload(scheduler);
    return scheduler;
}

/**
 * For the editor leaving a Page: saves what is pending at once, without the navigation waiting
 * for it, and keeps the scheduler until everything is saved. A Page whose last save failed is kept
 * too, so it reopens from the Contenu typed.
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

/**
 * While something is unsaved, whether the Page is open or was left, and after a failed save until a
 * later one succeeds, closing or reloading the tab saves what is pending at once and has the
 * browser warn: it may cut the save short. Listening only then keeps the tab closing normally, and
 * in the back/forward cache, once all is saved.
 */
function saveOnUnload(scheduler: SaveScheduler<PageContent>) {
    function onBeforeUnload(event: BeforeUnloadEvent) {
        scheduler.saveNow();
        if (scheduler.hasUnsaved()) event.preventDefault();
    }
    scheduler.subscribe(() => {
        if (scheduler.hasUnsaved()) {
            window.addEventListener('beforeunload', onBeforeUnload);
        } else {
            window.removeEventListener('beforeunload', onBeforeUnload);
        }
    });
}
