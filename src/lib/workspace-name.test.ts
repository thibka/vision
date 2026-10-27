import { describe, expect, it } from 'vitest';
import {
    isEmoji,
    truncateWorkspaceName,
    workspaceIcon,
    workspaceNameLength,
} from './workspace-name';

describe('workspaceIcon', () => {
    it('is the uppercase initial of the name by default', () => {
        expect(workspaceIcon({ name: 'recettes', icon: null })).toBe('R');
    });

    it('follows the name when it changes', () => {
        expect(workspaceIcon({ name: 'Recettes', icon: null })).toBe('R');
        expect(workspaceIcon({ name: 'Voyages', icon: null })).toBe('V');
    });

    it('ignores leading spaces', () => {
        expect(workspaceIcon({ name: '  recettes', icon: null })).toBe('R');
    });

    it('is the emoji the name starts with', () => {
        expect(workspaceIcon({ name: '🍳 Recettes', icon: null })).toBe('🍳');
        expect(workspaceIcon({ name: '👨‍👩‍👧 Famille', icon: null })).toBe('👨‍👩‍👧');
        expect(workspaceIcon({ name: '🇫🇷France', icon: null })).toBe('🇫🇷');
    });

    it('does not take a digit for an emoji', () => {
        expect(workspaceIcon({ name: '2024 notes', icon: null })).toBe('2');
    });

    it('prefers the picked emoji to the one in the name', () => {
        expect(workspaceIcon({ name: '🍳 Recettes', icon: '🥗' })).toBe('🥗');
        expect(workspaceIcon({ name: 'Recettes', icon: '🥗' })).toBe('🥗');
    });

    it('is empty for an empty name', () => {
        expect(workspaceIcon({ name: '  ', icon: null })).toBe('');
    });
});

describe('isEmoji', () => {
    it('accepts exactly one emoji', () => {
        expect(isEmoji('🍳')).toBe(true);
        expect(isEmoji('👍🏽')).toBe(true);
    });

    it('refuses anything else', () => {
        for (const value of ['', 'a', '1', '🍳🍳', '🍳a']) {
            expect(isEmoji(value)).toBe(false);
        }
    });
});

describe('name length', () => {
    it('counts characters, not UTF-16 units', () => {
        expect(workspaceNameLength('🍳🍳')).toBe(2);
    });

    it('truncates without cutting a character in two', () => {
        expect([...truncateWorkspaceName('🍳'.repeat(60))]).toHaveLength(50);
    });
});
