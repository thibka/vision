"use client"; // this registers <Editor> as a Client Component
import "@blocknote/core/fonts/inter.css";
import type { PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { PageContent } from "@/lib/pages";
import { leavePage, pageSaveScheduler } from "@/lib/save-scheduler-registry";

export default function Editor({
    pageId,
    initialContent,
    saveAction,
}: {
    pageId: string;
    initialContent: PageContent;
    saveAction: (content: PageContent) => Promise<void>;
}) {
    const [scheduler] = useState(() => pageSaveScheduler(pageId, saveAction));
    // A Page left before its save ended starts from the latest Contenu typed
    const content = scheduler.latest() ?? initialContent;
    // An empty Contenu starts an empty editor, which BlockNote can't be given as initial content.
    // The Page title is shown above the editor, not repeated in it.
    const editor = useCreateBlockNote({
        initialContent:
            content.length > 0 ? (content as PartialBlock[]) : undefined,
    });

    // Nothing is shown while saves succeed. The text typed stays in the editor after a failure.
    const hasFailed = useSyncExternalStore(
        scheduler.subscribe,
        scheduler.hasFailed,
    );

    useEffect(() => () => leavePage(pageId, scheduler), [pageId, scheduler]);

    return (
        <>
            {/* Always rendered, so screen readers announce the message when it appears */}
            <p role="status" className="px-12 text-sm text-text-muted">
                {hasFailed && "Content not saved"}
            </p>
            <BlockNoteView
                editor={editor}
                onChange={() => scheduler.change(editor.document)}
                theme={{
                    borderRadius: 0,
                    colors: {
                        editor: {
                            text: "inherit",
                            background: "transparent",
                        },
                    },
                }}
            />
        </>
    );
}
