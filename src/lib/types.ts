
export interface SongContent {
  title: string;
  number: string;
  author: string;
  year: string;
  key?: string;
  verses: string[];
  chorus?: string;
  /** URL or data URI for sheet music, specific to this language version. */
  partitionUrl?: string;
  /** URL or data URI for audio, specific to this language version. */
  audioUrl?: string;
}

export interface Song {
  id: string;
  content: {
    en?: SongContent;
    fr?: SongContent;
  };
}

export type NewSong = Omit<Song, 'id'>;

export const getDisplayTitle = (song: Song, lang?: 'en' | 'fr') => {
  if (lang) return song.content?.[lang]?.title || song.content?.[lang === 'en' ? 'fr' : 'en']?.title || "Untitled Song";
  return song.content?.en?.title || song.content?.fr?.title || "Untitled Song";
};

export const getDisplayNumber = (song: Song, lang?: 'en' | 'fr') => {
  if (lang) return song.content?.[lang]?.number || song.content?.[lang === 'en' ? 'fr' : 'en']?.number || "???";
  return song.content?.en?.number || song.content?.fr?.number || "???";
};

export const getDisplayAuthor = (song: Song, lang?: 'en' | 'fr') => {
  if (lang) return song.content?.[lang]?.author || song.content?.[lang === 'en' ? 'fr' : 'en']?.author || "Anonymous";
  return song.content?.en?.author || song.content?.fr?.author || "Anonymous";
};

/** True when this language version has a partition URL. */
export function contentHasPartition(
  content: SongContent | undefined
): boolean {
  return Boolean(content?.partitionUrl?.trim());
}

/** True when this language version has an audio URL. */
export function contentHasAudio(content: SongContent | undefined): boolean {
  return Boolean(content?.audioUrl?.trim());
}

/** Partition URL present for a given document language. */
export function songHasPartition(
  song: Song,
  lang: "en" | "fr"
): boolean {
  return contentHasPartition(song.content[lang]);
}

/** Audio URL present for a given document language. */
export function songHasAudio(song: Song, lang: "en" | "fr"): boolean {
  return contentHasAudio(song.content[lang]);
}
