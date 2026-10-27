'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import InputSearch from '@/components/InputSearch';
import ButtonIcon from '@/components/ButtonIcon';
import WorkspaceAvatar from '@/components/WorkspaceAvatar';
import { cx, focusRing } from '@/lib/utils';
import { workspaceIcon } from '@/lib/workspace-name';
import type { Workspace } from '@/lib/workspaces';

function CreateWorkspaceButton() {
    // Disabled while the Workspace is being created, so a double click doesn't create two
    const { pending } = useFormStatus();
    return (
        <ButtonIcon type="submit" disabled={pending}>
            Create workspace
        </ButtonIcon>
    );
}

export default function SidebarWorkspaces({
    workspaces,
    currentWorkspaceId,
    createWorkspaceAction,
}: {
    workspaces: Workspace[];
    currentWorkspaceId: string;
    createWorkspaceAction: () => Promise<void>;
}) {
    const [filter, setFilter] = useState('');
    const query = filter.trim().toLowerCase();
    const visibleWorkspaces = query
        ? workspaces.filter((workspace) =>
              workspace.name.toLowerCase().includes(query),
          )
        : workspaces;

    return (
        <>
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
                                            'flex items-center gap-2 rounded-md py-1.5 px-2 text-sm',
                                            isCurrent
                                                ? 'bg-bg-hover font-medium text-text-primary'
                                                : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                                            focusRing,
                                        )}
                                    >
                                        <WorkspaceAvatar size="sm" icon={workspaceIcon(workspace)} />
                                        <span className="truncate min-w-0">{workspace.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
            <form
                action={createWorkspaceAction}
                className="mt-auto border-t border-sidebar-border pt-4 p-4"
            >
                <CreateWorkspaceButton />
            </form>
        </>
    );
}
