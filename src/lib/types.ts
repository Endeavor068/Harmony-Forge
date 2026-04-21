
export interface SongContent {
  title: string;
  number: string;
  author: string;
  year: string;
  key?: string;
  verses: string[];
  chorus?: string;
}

export interface Song {
  id: string;
  content: {
    en?: SongContent;
    fr?: SongContent;
  };
  partitionUrl?: string;
  audioUrl?: string;
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

/** True when a partition / sheet URL is stored (Firestore or any HTTPS URL). */
export function songHasPartition(song: Pick<Song, 'partitionUrl'>): boolean {
  return Boolean(song.partitionUrl?.trim());
}

/** True when an audio URL is stored. */
export function songHasAudio(song: Pick<Song, 'audioUrl'>): boolean {
  return Boolean(song.audioUrl?.trim());
}
