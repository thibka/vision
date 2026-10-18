"use client"; // this registers <Editor> as a Client Component
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

export default function Editor() {
    // Starts empty: the Page title is shown above the editor, not repeated in it
    const editor = useCreateBlockNote();

    return (
        <BlockNoteView
            editor={editor}
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
