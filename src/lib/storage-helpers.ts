import type { FirebaseStorage } from "firebase/storage";
import { deleteObject, ref } from "firebase/storage";

/**
 * Indique si l’URL ressemble à une URL de téléchargement Firebase Storage.
 */
export function isFirebaseStorageDownloadUrl(url: string): boolean {
  const u = url.trim();
  return (
    u.includes("firebasestorage.googleapis.com") ||
    (u.includes("googleapis.com") && u.includes("/o/"))
  );
}

/**
 * Extrait le chemin d’objet (`partition_1.pdf`, etc.) depuis une URL HTTPS
 * `…/v0/b/{bucket}/o/{encodedPath}?…`.
 */
function objectPathFromFirebaseDownloadUrl(downloadUrl: string): string | null {
  try {
    const u = new URL(downloadUrl.trim());
    if (!u.hostname.includes("firebasestorage.googleapis.com")) {
      return null;
    }
    const marker = "/o/";
    const i = u.pathname.indexOf(marker);
    if (i === -1) return null;
    const encoded = u.pathname.slice(i + marker.length);
    if (!encoded) return null;
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}

/**
 * Supprime l’objet pointé par une URL de téléchargement Firebase Storage (si applicable).
 * Ignore les erreurs (fichier déjà supprimé, URL externe, etc.).
 */
export async function deleteFirebaseStorageObjectByUrl(
  storage: FirebaseStorage,
  downloadUrl: string
): Promise<void> {
  const u = downloadUrl.trim();
  if (!u || !isFirebaseStorageDownloadUrl(u)) return;
  const path = objectPathFromFirebaseDownloadUrl(u);
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch {
    /* déjà absent ou URL non gérée */
  }
}
