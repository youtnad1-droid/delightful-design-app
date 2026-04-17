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
  categoryId: string;
  streamUrl: string;
  logoUrl?: string;
  epgChannelId?: string;
}

export interface Movie {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  streamUrl: string;
  posterUrl?: string;
  rating?: string;
  year?: string;
  containerExtension?: string;
}

export interface Series {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  posterUrl?: string;
  rating?: string;
  plot?: string;
}

export interface XtreamCategory {
  category_id: string;
  category_name: string;
}
