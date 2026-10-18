"use client"; // this registers <Editor> as a Client Component
import "@blocknote/core/fonts/inter.css";
import type { PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useState } from "react";
import type { PageContent } from "@/lib/pages";
import { createSaveScheduler } from "@/lib/save-scheduler";

const SAVE_DELAY_MS = 1000;

export default function Editor({
    initialContent,
    saveAction,
}: {
    initialContent: PageContent;
    saveAction: (content: PageContent) => Promise<void>;
}) {
    // An empty Contenu starts an empty editor, which BlockNote can't be given as initial content.
    // The Page title is shown above the editor, not repeated in it.
    const editor = useCreateBlockNote({
        initialContent:
            initialContent.length > 0
                ? (initialContent as PartialBlock[])
                : undefined,
    });
    const [scheduler] = useState(() =>
        createSaveScheduler(saveAction, SAVE_DELAY_MS),
    );

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
