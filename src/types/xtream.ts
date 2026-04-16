export interface XtreamProfile {
  id: string;
  name: string;
  serverUrl: string;
  username: string;
  password: string;
}

export interface Channel {
  id: string;
  name: string;
  category: string;
  streamUrl: string;
  logoUrl?: string;
  isFavorite: boolean;
}

export interface Movie {
  id: string;
  name: string;
  category: string;
  streamUrl: string;
  posterUrl?: string;
  rating?: string;
  year?: string;
}

export interface Series {
  id: string;
  name: string;
  category: string;
  posterUrl?: string;
  rating?: string;
  seasons?: number;
}
