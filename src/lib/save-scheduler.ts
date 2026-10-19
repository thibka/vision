// Free of React and BlockNote, so it can be tested on its own with fake timers

export type SaveScheduler<T> = ReturnType<typeof createSaveScheduler<T>>;

/**
 * Schedules the saves of a Contenu while it is being edited. A save starts `delay` ms after the
 * last change, and only one runs at a time: a save can never overwrite a more recent one.
 */
export function createSaveScheduler<T>(
    save: (content: T) => Promise<unknown>,
    delay: number,
) {
    let latest: T | undefined;
    // Set while the delay since the last change is running
    let timer: ReturnType<typeof setTimeout> | undefined;
    // The delay has passed since the last change, which waits for the running save to end
    let isDue = false;
    let isSaving = false;
    // The last save failed, and no save has succeeded since
    let lastSaveFailed = false;
    const listeners = new Set<() => void>();

    function notify() {
        for (const listener of listeners) listener();
    }

    async function saveIfDue() {
        if (!isDue || isSaving) return;
        isDue = false;
        isSaving = true;
        try {
            await save(latest as T);
            lastSaveFailed = false;
        } catch {
            // Not retried: the next change starts a new save
            lastSaveFailed = true;
        } finally {
            isSaving = false;
        }
        // The changes made during the save leave together, with the latest Contenu only
        saveIfDue();
        notify();
    }

    /** Saves the pending change without waiting for the delay, or once the running save ends */
    function saveNow() {
        if (timer === undefined) return;
        clearTimeout(timer);
        timer = undefined;
        isDue = true;
        saveIfDue();
    }

    return {
        /** Signals a change, with the Contenu as it now stands. Nothing is saved before one. */
        change(content: T) {
            latest = content;
            isDue = false;
            clearTimeout(timer);
            timer = setTimeout(saveNow, delay);
            notify();
        },

        saveNow,

        /** True while a change waits for its save, while a save is running, or after a failed one */
        hasUnsaved() {
            return timer !== undefined || isDue || isSaving || lastSaveFailed;
        },

        /** True once a save has failed, until a later save succeeds */
        hasFailed() {
            return lastSaveFailed;
        },

        /** The Contenu of the last change signaled, if any */
        latest() {
            return latest;
        },

        /**
         * Calls `listener` whenever what `hasUnsaved` or `hasFailed` say may have changed. Returns
         * the unsubscribe.
         */
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
}
