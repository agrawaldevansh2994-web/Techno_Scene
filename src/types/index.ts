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

export interface Profile {
  id: string;
  name: string;
  instagram?: string | null;
  whatsapp?: string | null;
  default_visibility?: 'name-only' | 'show-all' | 'selective' | null;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  visibility: 'name-only' | 'show-all' | 'selective';
  created_at: string;
  // Joined from profiles
  profiles?: Profile;
}
