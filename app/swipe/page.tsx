"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import SwipeDeck, { type Side } from "@/components/SwipeDeck";
import { itemKey, type ListStatus, type MediaItem, type WatchlistRow } from "@/lib/types";

const LOW_WATER = 5; // fetch another page when this few cards are left

export default function SwipePage() {
  const router = useRouter();

  const [queue, setQueue] = useState<MediaItem[]>([]);
  const [ready, setReady] = useState(false); // user's lists have loaded
  const [exhausted, setExhausted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<MediaItem | null>(null); // most recent saved swipe, for undo

  // Everything already in a list, already queued, or swiped this visit. Never shown again.
  const known = useRef(new Set<string>());
  const nextPage = useRef(1);
  const fetching = useRef(false);

  // Load the user's lists so anything already sorted is filtered out of the feed
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/db/watchlist");
        if (res.status === 401) return router.push("/login");
        if (!res.ok) throw new Error();
        const rows: WatchlistRow[] = await res.json();
        rows.forEach((r) => known.current.add(itemKey({ id: r.tmdb_id, mediaType: r.media_type })));
        setReady(true);
      } catch {
        setError("Couldn't load your lists.");
      }
    })();
  }, [router]);

  // Keep the queue topped up, skipping pages where everything is already sorted
  useEffect(() => {
    if (!ready || exhausted || queue.length >= LOW_WATER || fetching.current) return;
    fetching.current = true;
    (async () => {
      try {
        let fresh: MediaItem[] = [];
        let hasMore = true;
        while (fresh.length === 0 && hasMore) {
          const res = await fetch(`/api/feed?page=${nextPage.current}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Couldn't load more titles.");
          nextPage.current++;
          hasMore = data.hasMore;
          fresh = (data.results as MediaItem[]).filter((m) => !known.current.has(itemKey(m)));
        }
        fresh.forEach((m) => known.current.add(itemKey(m)));
        setQueue((q) => [...q, ...fresh]);
        if (!hasMore) setExhausted(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't load more titles.");
      } finally {
        fetching.current = false;
      }
    })();
  }, [ready, exhausted, queue.length]);

  async function decide(m: MediaItem, side: Side) {
    const status: ListStatus = side === "right" ? "watched" : "watch";
    setQueue((q) => q.filter((i) => itemKey(i) !== itemKey(m)));
    setError(null);

    try {
      const res = await fetch("/api/db/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdb_id: m.id, media_type: m.mediaType, media_title: m.title, list_status: status }),
      });
      if (res.status === 401) return router.push("/login");
      if (!res.ok) throw new Error();
      setLast(m);
    } catch {
      setQueue((q) => [m, ...q]); // put it back on top
      setError("Couldn't save that. Try again.");
    }
  }

  async function undo() {
    const m = last;
    if (!m) return;
    setLast(null);
    setQueue((q) => [m, ...q]);

    try {
      const params = new URLSearchParams({ media_type: m.mediaType, tmdb_id: String(m.id) });
      const res = await fetch(`/api/db/watchlist?${params}`, { method: "DELETE" });
      if (res.status === 401) return router.push("/login");
      if (!res.ok) throw new Error();
    } catch {
      setQueue((q) => q.filter((i) => itemKey(i) !== itemKey(m)));
      setError("Couldn't undo that.");
    }
  }

  return (
    <>
      <div className="wl-swipe-intro">
        <h1>Seen it?</h1>
        <p>Swipe right if you&apos;ve seen it, left if you haven&apos;t.</p>
      </div>
      {error && <p className="wl-error wl-swipe-error" role="alert">{error}</p>}
      <SwipeDeck
        items={queue}
        left={{ label: "Haven't seen", tone: "watch" }}
        right={{ label: "Seen it", tone: "watched" }}
        onDecide={decide}
        onUndo={last ? undo : null}
        empty={exhausted ? "You've been through every popular title. Check back later." : error ? null : "Loading…"}
      />
    </>
  );
}
