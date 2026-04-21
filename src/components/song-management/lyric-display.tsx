"use client";

import { looksLikeHtml, lyricHasText } from "@/lib/lyric-html";
import { cn } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";

const SAFE_LYRIC = {
  ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "s", "span", "mark"],
  ALLOWED_ATTR: ["class"],
};

interface LyricDisplayProps {
  text: string | undefined;
  className?: string;
  /** Applied when rendering plain text (non-HTML). */
  plainClassName?: string;
}

/**
 * Renders legacy plain lyrics or sanitized rich HTML from the editor.
 */
export function LyricDisplay({
  text,
  className,
  plainClassName,
}: LyricDisplayProps) {
  const raw = text ?? "";
  if (!lyricHasText(raw)) return null;

  if (looksLikeHtml(raw)) {
    const safe = DOMPurify.sanitize(raw, SAFE_LYRIC);
    return (
      <div
        className={cn(
          "lyric-rich-text font-body leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_b]:font-semibold [&_em]:italic [&_i]:italic [&_u]:underline",
          className
        )}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  }

  return (
    <p className={cn("whitespace-pre-wrap", plainClassName, className)}>{raw}</p>
  );
}
