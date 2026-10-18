'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { TrashIcon } from '@radix-ui/react-icons';
import InputSearch from '@/components/InputSearch';
import ButtonIcon from '@/components/ButtonIcon';
import { cx, focusRing } from '@/lib/utils';
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

function DeleteWorkspaceButton() {
    // Disabled while the Workspace is being deleted, so a double click doesn't send a second delete
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            aria-label="Delete workspace"
            title="Delete workspace"
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

export default function SidebarWorkspaces({
    workspaces,
    currentWorkspaceId,
    createWorkspaceAction,
    deleteWorkspaceAction,
}: {
    workspaces: Workspace[];
    currentWorkspaceId: string;
    createWorkspaceAction: () => Promise<void>;
    deleteWorkspaceAction: (workspaceId: string, isCurrent: boolean) => Promise<void>;
}) {
    // Counted on the full list, not the filtered one: the filter doesn't change what can be deleted
    const canDelete = workspaces.length > 1;
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
                                <li key={workspace.id} className="group relative">
                                    <Link
                                        href={`/${workspace.id}`}
                                        aria-current={isCurrent ? 'page' : undefined}
                                        className={cx(
                                            'block truncate rounded-md py-1.5 pl-2 text-sm',
                                            // Right padding keeps the name clear of the delete button
                                            canDelete ? 'pr-8' : 'pr-2',
                                            // On the row, so the highlight stays while hovering the delete button
                                            isCurrent
                                                ? 'bg-bg-hover font-medium text-text-primary'
                                                : 'text-text-secondary group-hover:bg-bg-hover group-hover:text-text-primary',
                                            focusRing,
                                        )}
                                    >
                                        {workspace.name}
                                    </Link>
                                    {canDelete && (
                                        <form
                                            action={deleteWorkspaceAction.bind(
                                                null,
                                                workspace.id,
                                                isCurrent,
                                            )}
                                            onSubmit={(event) => {
                                                // Cancelling sends nothing
                                                if (
                                                    !confirm(
                                                        `Delete "${workspace.name}" and all its pages?`,
                                                    )
                                                ) {
                                                    event.preventDefault();
                                                }
                                            }}
                                            className="absolute inset-y-0 right-1 flex items-center"
                                        >
                                            <DeleteWorkspaceButton />
                                        </form>
                                    )}
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
