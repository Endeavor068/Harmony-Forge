/**
 * Helpers for hymn lyrics stored either as plain text (legacy) or rich HTML from TipTap.
 */

/** Whether the string looks like HTML (not exhaustive). */
export function looksLikeHtml(s: string): boolean {
  return /<[a-z][\s\S]*>/i.test(s.trim());
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Converts stored lyric text to HTML TipTap can load. Plain lines become
 * paragraphs; existing HTML is left unchanged.
 */
export function normalizeStoredLyricToHtml(raw: string | undefined): string {
  const s = raw ?? "";
  if (!s.trim()) return "<p></p>";
  if (looksLikeHtml(s)) return s;
  const lines = s.split("\n");
  const parts = lines.map((line) => {
    const esc = escapeHtml(line);
    return esc === "" ? "<p><br></p>" : `<p>${esc}</p>`;
  });
  return parts.length ? parts.join("") : "<p></p>";
}

/**
 * True if lyric field has visible text (ignores empty HTML like `<p></p>`).
 */
export function lyricHasText(raw: string | undefined): boolean {
  if (raw == null) return false;
  const stripped = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > 0;
}
