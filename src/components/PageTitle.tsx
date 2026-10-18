'use client';

import { startTransition, useLayoutEffect, useRef, useState } from 'react';
import { usePublishLivePageTitle } from '@/components/LivePageTitle';
import { cx } from '@/lib/utils';
import { normalizePageTitle, truncatePageTitle } from '@/lib/page-title';

function supportsFieldSizing() {
    return CSS.supports('field-sizing', 'content');
}

function fitHeight(textarea: HTMLTextAreaElement) {
    // Reset first, so the field can shrink when the title gets shorter
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
}

// `field-sizing: content` grows the textarea with its content. Where it is unsupported (e.g.
// Firefox), the height is set to the content's on mount, on every value change and on every
// width change.
function useFallbackAutoHeight(value: string) {
    const ref = useRef<HTMLTextAreaElement>(null);

    useLayoutEffect(() => {
        const textarea = ref.current;
        if (!textarea || supportsFieldSizing()) return;
        fitHeight(textarea);
    }, [value]);

    useLayoutEffect(() => {
        const textarea = ref.current;
        if (!textarea || supportsFieldSizing()) return;

        // Only width changes rewrap the title: the height changes set by `fitHeight` are skipped
        let lastWidth = textarea.offsetWidth;
        const observer = new ResizeObserver(() => {
            if (textarea.offsetWidth === lastWidth) return;
            lastWidth = textarea.offsetWidth;
            fitHeight(textarea);
        });
        observer.observe(textarea);
        return () => observer.disconnect();
    }, []);

    return ref;
}

export default function PageTitle({
    pageId,
    title,
    renameAction,
}: {
    pageId: string;
    title: string;
    renameAction: (title: string) => Promise<void>;
}) {
    const [draft, setDraft] = useState(title);
    const [savedTitle, setSavedTitle] = useState(title);
    const textareaRef = useFallbackAutoHeight(draft);
    const publishLiveTitle = usePublishLivePageTitle();

    // Published on keystrokes only, so a Page whose title isn't touched shows its saved title
    function changeDraft(value: string) {
        setDraft(value);
        publishLiveTitle({ pageId, title: normalizePageTitle(value) });
    }

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
                ref={textareaRef}
                aria-label="Page title"
                rows={1}
                value={draft}
                // A title is a single line, even when pasted from several. Truncated rather than
                // `maxLength`, which counts UTF-16 units where the server counts characters.
                onChange={(event) =>
                    changeDraft(
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
                    'block w-full resize-none overflow-hidden field-sizing-content bg-transparent',
                    'text-4xl font-bold outline-hidden',
                )}
            />
        </h1>
    );
}
