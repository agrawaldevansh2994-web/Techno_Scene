export interface AppEvent {
  id: string;
  created_at: string;
  title: string;
  artist: string;
  venue: string;
  date: string;
  genre: string;
  image: string;
  description: string;
  ticket_link?: string | null;
  youtube_id?: string | null;
}
