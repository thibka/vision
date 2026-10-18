'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
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

export default function SidebarPages({
    pages,
    createPageAction,
}: {
    pages: Page[];
    createPageAction: () => Promise<void>;
}) {
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
                            <li key={page.id}>
                                <Link
                                    href={`/${page.workspaceId}/${page.id}`}
                                    className={cx(
                                        'block truncate rounded-md px-2 py-1.5 text-sm text-text-secondary',
                                        'hover:bg-bg-hover hover:text-text-primary',
                                        focusRing,
                                    )}
                                >
                                    {page.title}
                                </Link>
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
