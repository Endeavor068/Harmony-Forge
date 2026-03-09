export interface SongContent {
  title: string;
  number: string;
  author: string;
  year: string;
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

export const getDisplayTitle = (song: Song) => {
  return song.content?.en?.title || song.content?.fr?.title || "Untitled Song";
};

export const getDisplayNumber = (song: Song) => {
  return song.content?.en?.number || song.content?.fr?.number || "???";
};

export const getDisplayAuthor = (song: Song) => {
  return song.content?.en?.author || song.content?.fr?.author || "Anonymous";
};
