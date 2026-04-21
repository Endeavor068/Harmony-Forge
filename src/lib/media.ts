/**
 * Détecte si une URL de partition pointe vers un PDF (nom de fichier ou encodage
 * typique des URLs Firebase Storage).
 */
export function isPdfUrl(url: string): boolean {
  if (!url.trim()) return false;
  const u = url.toLowerCase();
  if (u.includes(".pdf")) return true;
  if (u.includes("application%2fpdf") || u.includes("application/pdf")) {
    return true;
  }
  return false;
}

/**
 * Indique si l’URL ressemble à une image (extensions courantes dans le chemin).
 */
export function isImageUrl(url: string): boolean {
  if (!url.trim()) return false;
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$|&)/i.test(url);
}

/**
 * Indique si l’URL ressemble à un flux audio MP3.
 */
export function isMp3Url(url: string): boolean {
  if (!url.trim()) return false;
  const u = url.toLowerCase();
  if (u.includes(".mp3")) return true;
  if (u.includes("audio%2fmpeg") || u.includes("audio/mpeg")) return true;
  return false;
}
