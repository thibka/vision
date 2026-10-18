'use client';

import { startTransition, useState } from 'react';
import { cx } from '@/lib/utils';
import { normalizePageTitle, truncatePageTitle } from '@/lib/page-title';

export default function PageTitle({
    title,
    renameAction,
}: {
    title: string;
    renameAction: (title: string) => Promise<void>;
}) {
    const [draft, setDraft] = useState(title);
    const [savedTitle, setSavedTitle] = useState(title);

    // Enter and Escape blur the field, so every way out of it saves through here: there is no cancel
    function save() {
        const normalized = normalizePageTitle(draft);
        setDraft(normalized);
        if (normalized === savedTitle) return;

        setSavedTitle(normalized);
        startTransition(() => renameAction(normalized));
    }

    return (
        <h1 className="px-12 py-10">
            {/* A textarea rather than an input, so a long title wraps like a heading */}
            <textarea
                aria-label="Page title"
                rows={1}
                value={draft}
                // A title is a single line, even when pasted from several. Truncated rather than
                // `maxLength`, which counts UTF-16 units where the server counts characters.
                onChange={(event) =>
                    setDraft(
                        truncatePageTitle(
                            event.target.value.replace(/\r?\n/g, ' '),
                        ),
                    )
                }
                onKeyDown={(event) => {
                    if (event.nativeEvent.isComposing) return;
                    if (event.key === 'Enter' || event.key === 'Escape') {
                        event.preventDefault();
                        event.currentTarget.blur();
                    }
                }}
                onBlur={save}
                className={cx(
                    'block w-full resize-none field-sizing-content bg-transparent',
                    'text-4xl font-bold outline-hidden',
                )}
            />
        </h1>
    );
}
