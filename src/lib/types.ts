
export interface SongContent {
  title: string;
  verses: string[];
  chorus?: string;
}

export interface Song {
  id: string;
  number: string;
  author: string;
  year: string;
  content: {
    en?: SongContent;
    fr?: SongContent;
  };
  partitionUrl?: string;
  audioUrl?: string;
}

export type NewSong = Omit<Song, 'id'>;

export const getDisplayTitle = (song: Song) => {
  return song.content.en?.title || song.content.fr?.title || "Untitled Song";
};
