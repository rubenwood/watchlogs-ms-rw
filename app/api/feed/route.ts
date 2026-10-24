import { NextRequest, NextResponse } from "next/server";
import type { MediaItem } from "@/lib/types";
import { tmdb, toMediaItem, type TmdbResult } from "@/lib/tmdb";

// Popular, reasonably well-known titles; the vote floor keeps out obscure entries
const DISCOVER = { sort_by: "popularity.desc", "vote_count.gte": "100", include_adult: "false" };
const MAX_PAGE = 500; // TMDB caps discover at 500 pages

// GET /api/feed?page=1 -> one page of popular movies and one of shows, interleaved
export async function GET(req: NextRequest) {
  const page = Math.min(MAX_PAGE, Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1));

  try {
    const [movies, shows] = await Promise.all([
      tmdb("/discover/movie", { ...DISCOVER, page: String(page) }),
      tmdb("/discover/tv", { ...DISCOVER, page: String(page) }),
    ]);

    const m: MediaItem[] = (movies.results ?? []).map((r: TmdbResult) => toMediaItem(r, "movie", "w500"));
    const t: MediaItem[] = (shows.results ?? []).map((r: TmdbResult) => toMediaItem(r, "tv", "w500"));
    const results: MediaItem[] = [];
    for (let i = 0; i < Math.max(m.length, t.length); i++) {
      if (m[i]) results.push(m[i]);
      if (t[i]) results.push(t[i]);
    }

    const totalPages = Math.min(MAX_PAGE, Math.max(movies.total_pages ?? 0, shows.total_pages ?? 0));
    return NextResponse.json({ results, hasMore: page < totalPages });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Feed failed" }, { status: 502 });
  }
}
