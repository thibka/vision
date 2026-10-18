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

describe('without a change', () => {
    it('saves nothing', async () => {
        scheduler();

        await wait(DELAY * 10);

        expect(saves).toEqual([]);
    });
});
