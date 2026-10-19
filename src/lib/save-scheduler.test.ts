import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSaveScheduler } from './save-scheduler';

const DELAY = 1000;

type Save = {
    content: string;
    isRunning: boolean;
    resolve: () => void;
    reject: () => void;
};

let saves: Save[];
let running: number;
let maxRunning: number;

// A save that ends only when the test resolves or rejects it, counting the saves running together
function fakeSave(content: string) {
    running++;
    maxRunning = Math.max(maxRunning, running);
    return new Promise<void>((resolve, reject) => {
        const save: Save = {
            content,
            isRunning: true,
            resolve: () => {
                save.isRunning = false;
                running--;
                resolve();
            },
            reject: () => {
                save.isRunning = false;
                running--;
                reject(new Error('Save failed'));
            },
        };
        saves.push(save);
    });
}

function scheduler() {
    return createSaveScheduler(fakeSave, DELAY);
}

// Moves the clock on, and lets the saves that ended run their continuation
function wait(ms: number) {
    return vi.advanceTimersByTimeAsync(ms);
}

const contents = () => saves.map((save) => save.content);

beforeEach(() => {
    vi.useFakeTimers();
    saves = [];
    running = 0;
    maxRunning = 0;
});

afterEach(() => {
    vi.useRealTimers();
});

describe('delay', () => {
    it('saves nothing before the delay', async () => {
        const { change } = scheduler();

        change('a');
        await wait(DELAY - 1);

        expect(saves).toEqual([]);
    });

    it('saves the Contenu once the delay has passed', async () => {
        const { change } = scheduler();

        change('a');
        await wait(DELAY);

        expect(contents()).toEqual(['a']);
    });

    it('saves once, with the latest Contenu, after changes close together', async () => {
        const { change } = scheduler();

        change('a');
        await wait(DELAY - 1);
        change('ab');
        await wait(DELAY - 1);
        change('abc');
        await wait(DELAY - 1);

        expect(saves).toEqual([]);
        await wait(1);
        expect(contents()).toEqual(['abc']);
        await wait(DELAY * 10);
        expect(contents()).toEqual(['abc']);
    });

    it('saves again after a later change', async () => {
        const { change } = scheduler();

        change('a');
        await wait(DELAY);
        saves[0].resolve();
        change('ab');
        await wait(DELAY);

        expect(contents()).toEqual(['a', 'ab']);
    });
});

describe('order', () => {
    it('starts no other save while one is running', async () => {
        const { change } = scheduler();

        change('a');
        await wait(DELAY);
        change('ab');
        await wait(DELAY * 10);

        expect(contents()).toEqual(['a']);
        expect(maxRunning).toBe(1);
    });

    it('saves the changes made during a save together at its end, with the latest Contenu only', async () => {
        const { change } = scheduler();

        change('a');
        await wait(DELAY);
        change('ab');
        await wait(DELAY / 2);
        change('abc');
        await wait(DELAY * 2);
        saves[0].resolve();
        await wait(0);

        expect(contents()).toEqual(['a', 'abc']);
        saves[1].resolve();
        await wait(DELAY * 10);
        expect(contents()).toEqual(['a', 'abc']);
        expect(maxRunning).toBe(1);
    });

    it('still waits for the delay after the last change when the running save ends sooner', async () => {
        const { change } = scheduler();

        change('a');
        await wait(DELAY);
        change('ab');
        saves[0].resolve();
        await wait(DELAY - 1);

        expect(contents()).toEqual(['a']);
        await wait(1);
        expect(contents()).toEqual(['a', 'ab']);
    });

    it('never runs two saves at once, however the changes and the saves interleave', async () => {
        const { change } = scheduler();

        for (let i = 0; i < 20; i++) {
            change(`v${i}`);
            await wait((i % 3) * DELAY);
            // Ends the running save every other step
            if (i % 2) saves.find((save) => save.isRunning)?.resolve();
        }
        let save: Save | undefined;
        while ((save = saves.find((save) => save.isRunning))) {
            save.resolve();
            await wait(DELAY * 2);
        }

        expect(maxRunning).toBe(1);
        expect(contents().at(-1)).toBe('v19');
    });

    it('goes on with the next save after a failed one', async () => {
        const { change } = scheduler();

        change('a');
        await wait(DELAY);
        change('ab');
        await wait(DELAY);
        saves[0].reject();
        await wait(0);

        expect(contents()).toEqual(['a', 'ab']);
    });
});

describe('save now', () => {
    it('saves the pending change at once, and the delayed save does not follow', async () => {
        const { change, saveNow } = scheduler();

        change('a');
        await wait(DELAY / 2);
        saveNow();

        expect(contents()).toEqual(['a']);
        saves[0].resolve();
        await wait(DELAY * 10);
        expect(contents()).toEqual(['a']);
    });

    it('saves nothing without a pending change', async () => {
        const { change, saveNow } = scheduler();

        saveNow();
        await wait(DELAY * 10);
        expect(saves).toEqual([]);

        change('a');
        await wait(DELAY);
        saves[0].resolve();
        await wait(0);
        saveNow();
        await wait(DELAY * 10);
        expect(contents()).toEqual(['a']);
    });

    it('starts no other save while one is running, and saves the latest Contenu at its end', async () => {
        const { change, saveNow } = scheduler();

        change('a');
        await wait(DELAY);
        change('ab');
        change('abc');
        saveNow();

        expect(contents()).toEqual(['a']);
        saves[0].resolve();
        await wait(0);
        expect(contents()).toEqual(['a', 'abc']);
        saves[1].resolve();
        await wait(DELAY * 10);
        expect(contents()).toEqual(['a', 'abc']);
        expect(maxRunning).toBe(1);
    });
});

describe('unsaved', () => {
    it('is unsaved during the delay', async () => {
        const { change, hasUnsaved } = scheduler();

        change('a');
        await wait(DELAY - 1);

        expect(hasUnsaved()).toBe(true);
    });

    it('is unsaved while a save is running', async () => {
        const { change, hasUnsaved } = scheduler();

        change('a');
        await wait(DELAY * 10);

        expect(saves[0].isRunning).toBe(true);
        expect(hasUnsaved()).toBe(true);
    });

    it('is unsaved while a save started at once is running', () => {
        const { change, saveNow, hasUnsaved } = scheduler();

        change('a');
        saveNow();

        expect(hasUnsaved()).toBe(true);
    });

    it('is saved once the save has ended', async () => {
        const { change, hasUnsaved } = scheduler();

        change('a');
        await wait(DELAY);
        saves[0].resolve();
        await wait(0);

        expect(hasUnsaved()).toBe(false);
    });

    it('is unsaved until the save of the changes made during a save has ended', async () => {
        const { change, hasUnsaved } = scheduler();

        change('a');
        await wait(DELAY);
        change('ab');
        await wait(DELAY);
        saves[0].resolve();
        await wait(0);

        expect(hasUnsaved()).toBe(true);
        saves[1].resolve();
        await wait(0);
        expect(hasUnsaved()).toBe(false);
    });

    it('notifies when it becomes saved', async () => {
        const { change, subscribe, hasUnsaved } = scheduler();
        const seen: boolean[] = [];
        subscribe(() => seen.push(hasUnsaved()));

        change('a');
        await wait(DELAY);
        saves[0].resolve();
        await wait(0);

        expect(seen.at(-1)).toBe(false);
    });
});

describe('failure', () => {
    it('is not failed while saves succeed', async () => {
        const { change, hasFailed } = scheduler();

        expect(hasFailed()).toBe(false);
        change('a');
        await wait(DELAY);
        saves[0].resolve();
        await wait(0);

        expect(hasFailed()).toBe(false);
    });

    it('is failed after a failed save, and notifies it', async () => {
        const { change, subscribe, hasFailed } = scheduler();
        const seen: boolean[] = [];
        subscribe(() => seen.push(hasFailed()));

        change('a');
        await wait(DELAY);
        saves[0].reject();
        await wait(0);

        expect(hasFailed()).toBe(true);
        expect(seen.at(-1)).toBe(true);
    });

    it('does not retry a failed save on its own', async () => {
        const { change, saveNow } = scheduler();

        change('a');
        await wait(DELAY);
        saves[0].reject();
        await wait(DELAY * 10);
        saveNow();
        await wait(DELAY * 10);

        expect(contents()).toEqual(['a']);
    });

    it('is still unsaved after a failed save', async () => {
        const { change, hasUnsaved } = scheduler();

        change('a');
        await wait(DELAY);
        saves[0].reject();
        await wait(DELAY * 10);

        expect(hasUnsaved()).toBe(true);
    });

    it('saves again, with the latest Contenu, after the next change', async () => {
        const { change, hasFailed } = scheduler();

        change('a');
        await wait(DELAY);
        saves[0].reject();
        await wait(0);
        change('ab');
        await wait(DELAY);

        expect(contents()).toEqual(['a', 'ab']);
        expect(hasFailed()).toBe(true);
    });

    it('is neither failed nor unsaved once a later save succeeds, and notifies it', async () => {
        const { change, subscribe, hasFailed, hasUnsaved } = scheduler();
        const seen: boolean[] = [];
        subscribe(() => seen.push(hasFailed()));

        change('a');
        await wait(DELAY);
        saves[0].reject();
        await wait(0);
        change('ab');
        await wait(DELAY);
        saves[1].resolve();
        await wait(0);

        expect(hasFailed()).toBe(false);
        expect(hasUnsaved()).toBe(false);
        expect(seen.at(-1)).toBe(false);
    });

    it('clears the failure once the save of the changes made during the failed one succeeds', async () => {
        const { change, hasFailed, hasUnsaved } = scheduler();

        change('a');
        await wait(DELAY);
        change('ab');
        await wait(DELAY);
        saves[0].reject();
        await wait(0);

        expect(hasFailed()).toBe(true);
        saves[1].resolve();
        await wait(0);
        expect(hasFailed()).toBe(false);
        expect(hasUnsaved()).toBe(false);
    });
});

describe('without a change', () => {
    it('saves nothing', async () => {
        scheduler();

        await wait(DELAY * 10);

        expect(saves).toEqual([]);
    });

    it('has nothing unsaved', async () => {
        const { hasUnsaved } = scheduler();

        expect(hasUnsaved()).toBe(false);
        await wait(DELAY * 10);
        expect(hasUnsaved()).toBe(false);
    });
});
