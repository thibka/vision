"use client"; // this registers <Editor> as a Client Component
import "@blocknote/core/fonts/inter.css";
import type { PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useEffect, useState } from "react";
import type { PageContent } from "@/lib/pages";
import { createSaveScheduler } from "@/lib/save-scheduler";
import { keptSaveScheduler, leavePage } from "@/lib/save-scheduler-registry";

const SAVE_DELAY_MS = 1000;

export default function Editor({
    pageId,
    initialContent,
    saveAction,
}: {
    pageId: string;
    initialContent: PageContent;
    saveAction: (content: PageContent) => Promise<void>;
}) {
    // A Page left before its save ended goes on with the same scheduler, so its later changes are
    // saved after that save, and starts from the latest Contenu typed rather than the server's
    const [scheduler] = useState(
        () =>
            keptSaveScheduler(pageId) ??
            createSaveScheduler(saveAction, SAVE_DELAY_MS),
    );
    const content = scheduler.latest() ?? initialContent;
    // An empty Contenu starts an empty editor, which BlockNote can't be given as initial content.
    // The Page title is shown above the editor, not repeated in it.
    const editor = useCreateBlockNote({
        initialContent:
            content.length > 0 ? (content as PartialBlock[]) : undefined,
    });

    useEffect(() => () => leavePage(pageId, scheduler), [pageId, scheduler]);

    return (
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
    );
}
