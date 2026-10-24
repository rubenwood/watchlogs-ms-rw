export type MediaType = "movie" | "tv";
export type ListStatus = "watch" | "watched";
// Sub-sort of the "watch" (haven't seen) list; null until decided
export type WatchIntent = "will" | "wont";

export interface MediaItem {
  id: number;
  mediaType: MediaType;
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
export const itemKey = (i: Pick<MediaItem, "id" | "mediaType">) => `${i.mediaType}-${i.id}`;



export type WatchlistRow = {
  id:string;
  created_at:string;
  user_id:string;
  tmdb_id: number;
  media_type: MediaType;
  media_title: string;
  list_status: ListStatus;
  watch_intent?: WatchIntent | null;
};
