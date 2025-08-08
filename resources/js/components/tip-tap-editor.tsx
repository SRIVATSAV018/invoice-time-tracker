import { Editor } from '@tiptap/core'
import { useEffect, useRef, useState } from 'react'
import StarterKit from '@tiptap/starter-kit'
import { cn } from "@/lib/utils"
import { EditorContent, useEditor } from '@tiptap/react';

export default function TipTapEditor({
                                         value,
                                         onUpdate,
                                     }: {
    value: string
    onUpdate: (content: string) => void
}) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const lastHtmlRef = useRef<string>('')

    const editor = useEditor({
        extensions: [StarterKit],
        content: value,
        editorProps: {
            attributes: {
                class: cn(
                    "border-input file:text-foreground placeholder:text-muted-foreground min-h-36 selection:bg-primary selection:text-primary-foreground w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                ),
            },
        },
        onUpdate({ editor }) {
            const html = editor.getHTML()
            lastHtmlRef.current = html
            onUpdate?.(html)
        },
    });

    // Wenn sich der prop-Wert ändert, aber noch nicht im Editor gesetzt wurde
    useEffect(() => {
        if (editor && value !== lastHtmlRef.current) {
            editor.commands.setContent(value)
        }
    }, [value, editor])

    return (
        <EditorContent editor={editor} />
    );
}
