import type { MediaItem, MediaType } from "@/lib/types";

// Server-only: requires TMDB_API_KEY in .env.local
export async function tmdb(path: string, params: Record<string, string> = {}) {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set");

  const qs = new URLSearchParams({ ...params, api_key: key });
  const res = await fetch(`https://api.themoviedb.org/3${path}?${qs}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB request failed (${res.status})`);
  return res.json();
}

// The fields we read from a TMDB movie/tv result
export interface TmdbResult {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  overview?: string;
}

// TMDB uses title/release_date for movies and name/first_air_date for shows
export function toMediaItem(r: TmdbResult, mediaType: MediaType, posterSize = "w185"): MediaItem {
  return {
    id: r.id,
    mediaType,
    title: r.title ?? r.name ?? "Untitled",
    year: (r.release_date ?? r.first_air_date ?? "").slice(0, 4),
    poster: r.poster_path ? `https://image.tmdb.org/t/p/${posterSize}${r.poster_path}` : null,
    overview: r.overview ?? "",
  };
}
