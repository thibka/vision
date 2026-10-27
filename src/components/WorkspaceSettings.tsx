'use client';

import { useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import * as Dialog from '@radix-ui/react-dialog';
import type { Theme } from 'emoji-picker-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Label } from '@/components/Label';
import WorkspaceAvatar from '@/components/WorkspaceAvatar';
import { cx, focusRing } from '@/lib/utils';
import {
    MAX_WORKSPACE_NAME_LENGTH,
    isEmoji,
    workspaceIcon,
    workspaceNameLength,
} from '@/lib/workspace-name';
import type { Workspace } from '@/lib/workspaces';

// Loaded when the picker is first opened: it is heavy, and most visits never change an icon
const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
    ssr: false,
    loading: () => <p className="text-sm text-text-muted">Loading emojis…</p>,
});

function SettingsForm({
    workspace,
    pageCount,
    canDelete,
    updateAction,
    deleteAction,
    onSaved,
}: {
    workspace: Workspace;
    pageCount: number;
    canDelete: boolean;
    updateAction: (name: string, icon: string | null) => Promise<void>;
    deleteAction: () => Promise<void>;
    onSaved: () => void;
}) {
    const [name, setName] = useState(workspace.name);
    const [icon, setIcon] = useState(workspace.icon);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isSaving, startSaving] = useTransition();
    const [isDeleting, startDeleting] = useTransition();

    const trimmed = name.trim();
    const isTooLong = workspaceNameLength(trimmed) > MAX_WORKSPACE_NAME_LENGTH;
    const canSave = trimmed !== '' && !isTooLong && !isSaving && !isDeleting;

    return (
        <>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (!canSave) return;
                    startSaving(async () => {
                        await updateAction(trimmed, icon);
                        onSaved();
                    });
                }}
                className="flex flex-col gap-4"
            >
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label="Change icon"
                        aria-expanded={isPickerOpen}
                        title="Change icon"
                        onClick={() => setIsPickerOpen((open) => !open)}
                        className={cx('rounded-md', focusRing)}
                    >
                        <WorkspaceAvatar icon={workspaceIcon({ name, icon })} />
                    </button>
                    {icon !== null && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="px-2 py-1 text-text-secondary hover:bg-bg-hover"
                            onClick={() => setIcon(null)}
                        >
                            Reset icon
                        </Button>
                    )}
                </div>
                {isPickerOpen && (
                    <EmojiPicker
                        theme={'dark' as Theme}
                        width="100%"
                        height={320}
                        onEmojiClick={({ emoji }) => {
                            // The picker offers a few skin tone mixes that are not standard emoji, which the server refuses
                            if (!isEmoji(emoji)) return;
                            setIcon(emoji);
                            setIsPickerOpen(false);
                        }}
                    />
                )}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="workspace-name">Name</Label>
                    <Input
                        id="workspace-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        hasError={isTooLong}
                        aria-invalid={isTooLong || trimmed === ''}
                        aria-describedby={isTooLong ? 'workspace-name-error' : undefined}
                        autoComplete="off"
                    />
                    {isTooLong && (
                        <p id="workspace-name-error" role="alert" className="text-sm text-danger">
                            The name can have {MAX_WORKSPACE_NAME_LENGTH} characters at most.
                        </p>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Dialog.Close asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-text-secondary hover:bg-bg-hover"
                        >
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Button type="submit" disabled={!canSave} isLoading={isSaving} loadingText="Saving">
                        Save
                    </Button>
                </div>
            </form>

            <div className="mt-6 flex flex-col gap-3 border-t border-border-default pt-4">
                {!canDelete ? (
                    <>
                        <p className="text-sm text-text-muted">
                            This is your only workspace: it can&apos;t be deleted.
                        </p>
                        <Button type="button" variant="destructive" disabled className="self-start">
                            Delete workspace
                        </Button>
                    </>
                ) : isConfirmingDelete ? (
                    <>
                        <p className="text-sm text-text-secondary">
                            This permanently deletes &ldquo;{workspace.name}&rdquo; and its{' '}
                            {pageCount} {pageCount === 1 ? 'page' : 'pages'}.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="destructive"
                                isLoading={isDeleting}
                                loadingText="Deleting"
                                disabled={isSaving}
                                onClick={() => startDeleting(() => deleteAction())}
                            >
                                Delete permanently
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                disabled={isDeleting}
                                className="text-text-secondary hover:bg-bg-hover"
                                onClick={() => setIsConfirmingDelete(false)}
                            >
                                Keep it
                            </Button>
                        </div>
                    </>
                ) : (
                    <Button
                        type="button"
                        variant="destructive"
                        className="self-start"
                        onClick={() => setIsConfirmingDelete(true)}
                    >
                        Delete workspace
                    </Button>
                )}
            </div>
        </>
    );
}

export default function WorkspaceSettings({
    workspace,
    pageCount,
    canDelete,
    updateAction,
    deleteAction,
}: {
    workspace: Workspace;
    pageCount: number;
    canDelete: boolean;
    updateAction: (name: string, icon: string | null) => Promise<void>;
    deleteAction: () => Promise<void>;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger
                aria-label="Workspace settings"
                className={cx(
                    'flex min-w-0 w-full items-center gap-2 rounded-md -mx-1 px-1 py-1 text-left hover:bg-bg-hover',
                    focusRing,
                )}
            >
                <WorkspaceAvatar icon={workspaceIcon(workspace)} />
                <span className="text-sm font-semibold truncate min-w-0">{workspace.name}</span>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
                <Dialog.Content
                    className={cx(
                        'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
                        'max-h-[90vh] w-[min(28rem,calc(100vw-2rem))] overflow-y-auto',
                        'rounded-lg border border-border-default bg-bg-panel p-6 text-text-primary',
                    )}
                >
                    <Dialog.Title className="text-base font-semibold">Workspace settings</Dialog.Title>
                    <Dialog.Description className="mb-4 text-sm text-text-muted">
                        Rename the workspace, change its icon or delete it.
                    </Dialog.Description>
                    {/* Mounted only while open, so it starts from the saved values on each opening */}
                    <SettingsForm
                        workspace={workspace}
                        pageCount={pageCount}
                        canDelete={canDelete}
                        updateAction={updateAction}
                        deleteAction={deleteAction}
                        onSaved={() => setOpen(false)}
                    />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
