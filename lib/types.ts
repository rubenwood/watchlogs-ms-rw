export type MediaType = "movie" | "tv";
export type ListStatus = "watch" | "watched";

export interface MediaItem {
  id: number;
  type: MediaType;
  title: string;
  year: string;
  poster: string | null;
  overview: string;
}

export interface LoggedItem extends MediaItem {
  status: ListStatus;
  addedAt: number;
}

// movie and tv ids can collide on TMDB, so key on both
export const itemKey = (i: Pick<MediaItem, "id" | "type">) => `${i.type}-${i.id}`;