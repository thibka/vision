// Free of React and BlockNote, so it can be tested on its own with fake timers

/**
 * Schedules the saves of a Contenu while it is being edited. A save starts `delay` ms after the
 * last change, and only one runs at a time: a save can never overwrite a more recent one.
 */
export function createSaveScheduler<T>(
    save: (content: T) => Promise<unknown>,
    delay: number,
) {
    let latest: T;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // The delay has passed since the last change, which waits for the running save to end
    let isDue = false;
    let isSaving = false;

    async function saveIfDue() {
        if (!isDue || isSaving) return;
        isDue = false;
        isSaving = true;
        try {
            await save(latest);
        } catch {
            // Not retried: the next change starts a new save
        } finally {
            isSaving = false;
        }
        // The changes made during the save leave together, with the latest Contenu only
        saveIfDue();
    }

    return {
        /** Signals a change, with the Contenu as it now stands. Nothing is saved before one. */
        change(content: T) {
            latest = content;
            isDue = false;
            clearTimeout(timer);
            timer = setTimeout(() => {
                isDue = true;
                saveIfDue();
            }, delay);
        },
    };
}
