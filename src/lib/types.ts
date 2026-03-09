export interface Song {
  id: string;
  number: string;
  title: string;
  author: string;
  year: string;
  choruses: string[];
}

export type NewSong = Omit<Song, 'id'>;