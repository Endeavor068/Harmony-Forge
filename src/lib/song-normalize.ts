import type { Song, SongContent } from "@/lib/types";

/** Firestore or import payload may still use legacy top-level media fields. */
export type SongWithLegacyFields = Song & {
  partitionUrl?: string;
  audioUrl?: string;
};

function ensureContent(
  c: SongContent | undefined,
  base: SongContent
): SongContent {
  if (!c) return { ...base };
  return { ...base, ...c };
}

const emptyBlock = (): SongContent => ({
  title: "",
  number: "",
  author: "",
  year: "",
  key: "",
  verses: [""],
  chorus: "",
  partitionUrl: "",
  audioUrl: "",
});

/**
 * Merges legacy `partitionUrl` / `audioUrl` on the song into `content.en` and
 * `content.fr` when a language block is missing that URL. Does not override
 * per-language values already set.
 */
export function normalizeSong(raw: SongWithLegacyFields | Song): Song {
  const r = raw as SongWithLegacyFields;
  const legacyP = r.partitionUrl?.trim();
  const legacyA = r.audioUrl?.trim();

  const enBase = emptyBlock();
  const frBase = emptyBlock();
  const en0 = ensureContent(r.content?.en, enBase);
  const fr0 = ensureContent(r.content?.fr, frBase);

  const en = { ...en0 };
  const fr = { ...fr0 };

  if (legacyP) {
    if (!en.partitionUrl?.trim()) en.partitionUrl = legacyP;
    if (!fr.partitionUrl?.trim()) fr.partitionUrl = legacyP;
  }
  if (legacyA) {
    if (!en.audioUrl?.trim()) en.audioUrl = legacyA;
    if (!fr.audioUrl?.trim()) fr.audioUrl = legacyA;
  }

  return {
    id: r.id,
    content: { en, fr },
  };
}

/**
 * Shallow copy of a song with a media field updated on one language version.
 */
export function songWithLanguageMedia(
  song: Song,
  lang: "en" | "fr",
  field: "partitionUrl" | "audioUrl",
  value: string
): Song {
  const current = song.content[lang] ?? ({} as SongContent);
  return {
    ...song,
    content: {
      ...song.content,
      [lang]: { ...current, [field]: value },
    },
  };
}
