import { NextRequest, NextResponse } from "next/server";
import type { MediaItem } from "@/lib/types";

// Requires TMDB_API_KEY in .env.local (free key from themoviedb.org)
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const key = process.env.TMDB_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "TMDB_API_KEY is not set" }, { status: 500 });
  }

  const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(q)}&include_adult=false&api_key=${key}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }

  const data = await res.json();
  const results: MediaItem[] = (data.results ?? [])
    .filter((r: any) => r.media_type === "movie" || r.media_type === "tv")
    .map((r: any): MediaItem => ({
      id: r.id,
      mediaType: r.media_type,
      title: r.title ?? r.name ?? "Untitled",
      year: (r.release_date ?? r.first_air_date ?? "").slice(0, 4),
      poster: r.poster_path ? `https://image.tmdb.org/t/p/w185${r.poster_path}` : null,
      overview: r.overview ?? "",
    }));

  return NextResponse.json({ results });
}