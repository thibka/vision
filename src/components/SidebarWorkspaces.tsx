'use client';

import { useState } from 'react';
import Link from 'next/link';
import InputSearch from '@/components/InputSearch';
import { cx, focusRing } from '@/lib/utils';
import type { Workspace } from '@/lib/workspaces';

export default function SidebarWorkspaces({
    workspaces,
    currentWorkspaceId,
}: {
    workspaces: Workspace[];
    currentWorkspaceId: string;
}) {
    const [filter, setFilter] = useState('');
    const query = filter.trim().toLowerCase();
    const visibleWorkspaces = query
        ? workspaces.filter((workspace) =>
              workspace.name.toLowerCase().includes(query),
          )
        : workspaces;

    // No footer: "Create workspace" stays hidden until Workspace creation exists
    return (
        <div className="p-4">
            <InputSearch
                placeholder="Filter workspaces"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
            />
            {visibleWorkspaces.length === 0 ? (
                <p className="text-sm mt-4 text-text-muted">No workspaces found.</p>
            ) : (
                <ul className="mt-4 flex flex-col gap-0.5">
                    {visibleWorkspaces.map((workspace) => {
                        const isCurrent = workspace.id === currentWorkspaceId;
                        return (
                            <li key={workspace.id}>
                                <Link
                                    href={`/${workspace.id}`}
                                    aria-current={isCurrent ? 'page' : undefined}
                                    className={cx(
                                        'block truncate rounded-md px-2 py-1.5 text-sm',
                                        isCurrent
                                            ? 'bg-bg-hover font-medium text-text-primary'
                                            : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                                        focusRing,
                                    )}
                                >
                                    {workspace.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
