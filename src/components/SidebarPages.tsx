'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TrashIcon } from '@radix-ui/react-icons';
import InputSearch from '@/components/InputSearch';
import ButtonIcon from '@/components/ButtonIcon';
import { cx, focusRing } from '@/lib/utils';
import type { Page } from '@/lib/pages';

function CreatePageButton() {
    // Disabled while the Page is being created, so a double click doesn't create two
    const { pending } = useFormStatus();
    return (
        <ButtonIcon type="submit" disabled={pending}>
            Create page
        </ButtonIcon>
    );
}

function DeletePageButton() {
    // Disabled while the Page is being deleted, so a double click doesn't send a second delete
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            aria-label="Delete page"
            title="Delete page"
            className={cx(
                'rounded p-1 text-text-muted hover:text-text-primary disabled:pointer-events-none',
                // Hidden until the row is hovered or something in it has the keyboard focus
                'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
                focusRing,
            )}
        >
            <TrashIcon aria-hidden="true" />
        </button>
    );
}

export default function SidebarPages({
    pages,
    createPageAction,
    deletePageAction,
}: {
    pages: Page[];
    createPageAction: () => Promise<void>;
    deletePageAction: (pageId: string, isOpen: boolean) => Promise<void>;
}) {
    // The sidebar lives in the layout, which only knows the Workspace: the open Page is in the URL
    const { pageId: openPageId } = useParams<{ pageId?: string }>();
    const [filter, setFilter] = useState('');
    const query = filter.trim().toLowerCase();
    const visiblePages = query
        ? pages.filter((page) => page.title.toLowerCase().includes(query))
        : pages;

    return (
        <>
            <div className="p-4">
                <InputSearch
                    placeholder="Filter pages"
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                />
                {visiblePages.length === 0 ? (
                    <p className="text-sm mt-4 text-text-muted">No pages found.</p>
                ) : (
                    <ul className="mt-4 flex flex-col gap-0.5">
                        {visiblePages.map((page) => (
                            <li key={page.id} className="group relative">
                                <Link
                                    href={`/${page.workspaceId}/${page.id}`}
                                    className={cx(
                                        // Right padding keeps the title clear of the delete button
                                        'block truncate rounded-md py-1.5 pl-2 pr-8 text-sm text-text-secondary',
                                        // On the row, so the highlight stays while hovering the delete button
                                        'group-hover:bg-bg-hover group-hover:text-text-primary',
                                        focusRing,
                                    )}
                                >
                                    {page.title}
                                </Link>
                                <form
                                    action={deletePageAction.bind(
                                        null,
                                        page.id,
                                        page.id === openPageId,
                                    )}
                                    className="absolute inset-y-0 right-1 flex items-center"
                                >
                                    <DeletePageButton />
                                </form>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <form
                action={createPageAction}
                className="mt-auto border-t border-sidebar-border pt-4 p-4"
            >
                <CreatePageButton />
            </form>
        </>
    );
}
