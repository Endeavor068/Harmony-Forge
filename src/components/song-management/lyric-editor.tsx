"use client";

import { Button } from "@/components/ui/button";
import { normalizeStoredLyricToHtml } from "@/lib/lyric-html";
import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { Editor, EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Strikethrough, Underline } from "lucide-react";
import * as React from "react";

function LyricEditorToolbar({
  editor,
  disabled,
}: {
  editor: Editor | null;
  disabled: boolean;
}) {
  const flagsRaw = useEditorState({
    editor,
    selector: (snap) => {
      const ed = snap.editor;
      if (!ed) {
        return {
          bold: false,
          italic: false,
          underline: false,
          strike: false,
        };
      }
      return {
        bold: ed.isActive("bold"),
        italic: ed.isActive("italic"),
        underline: ed.isActive("underline"),
        strike: ed.isActive("strike"),
      };
    },
  });

  const flags = flagsRaw ?? {
    bold: false,
    italic: false,
    underline: false,
    strike: false,
  };

  if (!editor) return null;

  return (
    <div
      className="flex flex-wrap gap-0.5 border-b bg-muted/40 px-2 py-1.5"
      role="toolbar"
      aria-label="Formatage du texte"
    >
      <Button
        type="button"
        size="sm"
        variant={flags.bold ? "secondary" : "ghost"}
        className="h-8 w-8 p-0"
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
        aria-pressed={flags.bold}
        title="Gras"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={flags.italic ? "secondary" : "ghost"}
        className="h-8 w-8 p-0"
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        aria-pressed={flags.italic}
        title="Italique"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={flags.underline ? "secondary" : "ghost"}
        className="h-8 w-8 p-0"
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        aria-pressed={flags.underline}
        title="Souligné"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={flags.strike ? "secondary" : "ghost"}
        className="h-8 w-8 p-0"
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        aria-pressed={flags.strike}
        title="Barré"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
    </div>
  );
}

export interface LyricEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Styling variant (chorus uses accent border). */
  variant?: "default" | "chorus";
  /**
   * Change when the logical field changes so the editor remounts with the
   * right document (e.g. `${songId}-${lang}-verse-0`).
   */
  editorKey: string;
}

/**
 * Éditeur WYSIWYG (gras, italique, souligné, barré) pour couplets et refrain.
 */
export function LyricEditor({
  value,
  onChange,
  placeholder = "Saisir le texte…",
  disabled = false,
  className,
  variant = "default",
  editorKey,
}: LyricEditorProps) {
  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: false,
          bulletList: false,
          orderedList: false,
          blockquote: false,
          codeBlock: false,
          code: false,
          horizontalRule: false,
          link: false,
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass: "is-editor-empty",
        }),
      ],
      content: normalizeStoredLyricToHtml(value),
      editable: !disabled,
      editorProps: {
        attributes: {
          class: cn(
            "tiptap max-w-none min-h-[120px] px-3 py-2 text-sm leading-relaxed text-foreground outline-none",
            "[&_p]:mb-2 [&_p:last-child]:mb-0",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          ),
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChange(ed.getHTML());
      },
    },
    [editorKey]
  );

  React.useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  const borderClass =
    variant === "chorus"
      ? "border-accent/25 focus-within:border-accent/50"
      : "border-input";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border bg-background shadow-sm",
        borderClass,
        className
      )}
    >
      <LyricEditorToolbar editor={editor} disabled={disabled} />
      <EditorContent editor={editor} className="lyric-editor-content" />
    </div>
  );
}
