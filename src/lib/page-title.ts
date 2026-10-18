// Free of server imports, so the editable title can share these rules with the Pages module

/** The Titre par défaut, copied into every Page at its creation */
export const DEFAULT_PAGE_TITLE = 'New page';

export const MAX_PAGE_TITLE_LENGTH = 200;

/** Trims the title, and falls back to the Titre par défaut when nothing is left. */
export function normalizePageTitle(title: string) {
    return title.trim() || DEFAULT_PAGE_TITLE;
}

/** Counted in characters (code points), not in UTF-16 units nor in bytes. */
export function pageTitleLength(title: string) {
    return [...title].length;
}

/** Cuts the title to the maximum length, counted as `pageTitleLength` does. */
export function truncatePageTitle(title: string) {
    return [...title].slice(0, MAX_PAGE_TITLE_LENGTH).join('');
}
