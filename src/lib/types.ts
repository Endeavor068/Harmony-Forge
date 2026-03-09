export interface Song {
  id: string;
  number: string;
  title: string;
  author: string;
  year: string;
  verses: string[];
  chorus?: string;
  partitionUrl?: string;
  audioUrl?: string;
}

export type NewSong = Omit<Song, 'id'>;
