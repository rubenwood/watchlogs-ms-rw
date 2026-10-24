"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import SwipeDeck, { type Side } from "@/components/SwipeDeck";
import { itemKey, type MediaItem, type WatchIntent, type WatchlistRow } from "@/lib/types";

const PREFETCH = 3; // load posters for this many upcoming cards

const rowKey = (r: WatchlistRow) => itemKey({ id: r.tmdb_id, mediaType: r.media_type });

// The DB only stores the title; this is what a card shows until TMDB details arrive
function rowToStub(r: WatchlistRow): MediaItem {
  return { id: r.tmdb_id, mediaType: r.media_type, title: r.media_title, year: "", poster: null, overview: "" };
}

export default function UnseenPage() {
  const router = useRouter();

  const [rows, setRows] = useState<WatchlistRow[] | null>(null);
  const [details, setDetails] = useState<Record<string, MediaItem>>({});
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<WatchlistRow | null>(null); // most recent saved swipe, for undo
  const requested = useRef(new Set<string>());

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/db/watchlist?status=watch");
        if (res.status === 401) return router.push("/login");
        if (!res.ok) throw new Error();
        setRows(await res.json());
      } catch {
        setError("Couldn't load your lists.");
      }
    })();
  }, [router]);

  const queue = useMemo(() => (rows ?? []).filter((r) => !r.watch_intent), [rows]);
  const count = (i: WatchIntent) => (rows ?? []).filter((r) => r.watch_intent === i).length;

  // Fetch posters and blurbs for the next few cards
  useEffect(() => {
    for (const r of queue.slice(0, PREFETCH)) {
      const k = rowKey(r);
      if (requested.current.has(k)) continue;
      requested.current.add(k);
      const params = new URLSearchParams({ media_type: r.media_type, id: String(r.tmdb_id) });
      fetch(`/api/details?${params}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((m: MediaItem | null) => m && setDetails((d) => ({ ...d, [k]: m })))
        .catch(() => {}); // card falls back to the stored title
    }
  }, [queue]);

  async function setIntent(r: WatchlistRow, intent: WatchIntent | null) {
    setRows((rs) => rs && rs.map((x) => (rowKey(x) === rowKey(r) ? { ...x, watch_intent: intent } : x)));

    const res = await fetch("/api/db/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tmdb_id: r.tmdb_id,
        media_type: r.media_type,
        media_title: r.media_title,
        list_status: r.list_status,
        watch_intent: intent,
      }),
    });
    if (res.status === 401) {
      router.push("/login");
      return false;
    }
    return res.ok;
  }

  async function decide(m: MediaItem, side: Side) {
    const r = queue.find((x) => rowKey(x) === itemKey(m));
    if (!r) return;
    setError(null);
    const ok = await setIntent(r, side === "right" ? "will" : "wont").catch(() => false);
    if (ok) return setLast(r);
    setRows((rs) => rs && rs.map((x) => (rowKey(x) === rowKey(r) ? { ...x, watch_intent: null } : x)));
    setError("Couldn't save that. Try again.");
  }

  async function undo() {
    const r = last;
    if (!r) return;
    setLast(null);
    const ok = await setIntent(r, null).catch(() => false);
    if (!ok) setError("Couldn't undo that.");
  }

  const items = queue.map((r) => details[rowKey(r)] ?? rowToStub(r));

  return (
    <>
      <div className="wl-swipe-intro">
        <h1>Will you watch it?</h1>
        <p>
          Sorting your &ldquo;haven&apos;t seen&rdquo; list.{" "}
          {rows && `${queue.length} left · ${count("will")} will watch · ${count("wont")} won't watch`}
        </p>
      </div>
      {error && <p className="wl-error wl-swipe-error" role="alert">{error}</p>}
      <SwipeDeck
        items={items}
        left={{ label: "Won't watch", tone: "wont" }}
        right={{ label: "Will watch", tone: "will" }}
        onDecide={decide}
        onUndo={last ? undo : null}
        empty={rows ? "All sorted. Add more from Discover." : error ? null : "Loading…"}
      />
    </>
  );
}
