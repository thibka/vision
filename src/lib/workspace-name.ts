// Free of server imports, so the settings modal can share these rules with the Workspaces module

export const MAX_WORKSPACE_NAME_LENGTH = 50;

// `v` flag: RGI_Emoji matches whole emoji (ZWJ sequences, flags), and not digits or `#` like \p{Emoji}.
// Built from strings because the tsconfig target predates the flag, which the runtimes support.
const LEADING_EMOJI = new RegExp('^\\p{RGI_Emoji}', 'v');
const ONLY_EMOJI = new RegExp('^\\p{RGI_Emoji}$', 'v');

/** Counted in characters (code points), not in UTF-16 units nor in bytes. */
export function workspaceNameLength(name: string) {
    return [...name].length;
}

/** Cuts the name to the maximum length, counted as `workspaceNameLength` does. */
export function truncateWorkspaceName(name: string) {
    return [...name].slice(0, MAX_WORKSPACE_NAME_LENGTH).join('');
}

/** Whether the value is exactly one emoji, the only thing a Workspace's icon can be set to. */
export function isEmoji(value: string) {
    return ONLY_EMOJI.test(value);
}

const segmenter = new Intl.Segmenter();

/**
 * The Icône of a Workspace: the emoji picked by the user, else the emoji the name starts with,
 * else the initial of the name.
 */
export function workspaceIcon({
    name,
    icon,
}: {
    name: string;
    icon: string | null;
}) {
    if (icon) return icon;

    const trimmed = name.trim();
    const emoji = LEADING_EMOJI.exec(trimmed)?.[0];
    if (emoji) return emoji;

    const [first] = segmenter.segment(trimmed);
    return first ? first.segment.toUpperCase() : '';
}
