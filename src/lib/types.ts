export interface Song {
  id: string;
  number: string;
  title: string;
  author: string;
  year: string;
  verses: string[];
  chorus?: string;
}

export type NewSong = Omit<Song, 'id'>;
