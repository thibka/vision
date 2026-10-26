import { describe, expect, it } from 'vitest';
import { parseSidebarTab } from './sidebar-tab';

describe('parseSidebarTab', () => {
    it('keeps a known tab', () => {
        expect(parseSidebarTab('workspaces')).toBe('workspaces');
        expect(parseSidebarTab('pages')).toBe('pages');
    });

    it('falls back to pages when absent or unknown', () => {
        expect(parseSidebarTab(undefined)).toBe('pages');
        expect(parseSidebarTab('nope')).toBe('pages');
    });
});
