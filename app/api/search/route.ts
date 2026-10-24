import { NextRequest, NextResponse } from "next/server";
import type { MediaItem } from "@/lib/types";
import { toMediaItem } from "@/lib/tmdb";

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
    .map((r: any) => toMediaItem(r, r.media_type));

  return NextResponse.json({ results });
}