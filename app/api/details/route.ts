import { NextRequest, NextResponse } from "next/server";
import { tmdb, toMediaItem } from "@/lib/tmdb";

// GET /api/details?media_type=movie&id=603
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const type = params.get("media_type");
  const id = Number(params.get("id"));
  if ((type !== "movie" && type !== "tv") || !Number.isInteger(id)) {
    return NextResponse.json({ error: "Expected media_type=movie|tv and a numeric id" }, { status: 400 });
  }

  try {
    return NextResponse.json(toMediaItem(await tmdb(`/${type}/${id}`), type, "w500"));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lookup failed" }, { status: 502 });
  }
}
