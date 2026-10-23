"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import ListPanel from "@/components/ListPanel";
import { itemKey, type ListStatus, type LoggedItem, type MediaItem, type WatchlistRow } from "@/lib/types";


function rowToItem(r: WatchlistRow): LoggedItem {
  return {
    id: r.tmdb_id,
    mediaType: r.media_type,
    title: r.media_title,
    status: r.list_status,
    addedAt: new Date(r.created_at).getTime(),
  } as LoggedItem;
}

function itemToBody(m: MediaItem, status: ListStatus) {
  return {
    tmdb_id: m.id,
    media_type: m.mediaType,
    media_title: m.title,
    list_status: status,
  };
}

export default function Home() {
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);

  // search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // list state
  const [items, setItems] = useState<LoggedItem[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // keeps it in sync on login/logout/token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);


  // Load the user's lists from the API on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/db/watchlist");
        if (res.status === 401) return router.push("/login");
        if (!res.ok) throw new Error();
        const rows: WatchlistRow[] = await res.json();
        setItems(rows.map(rowToItem));
      } catch {
        setError("Couldn't load your lists.");
      }
    })();
  }, [router]);

  // Debounced search (unchanged)
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setError(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Search failed");
        setResults(data.results);
        setError(null);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message ?? "Search failed. Try again.");
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  function statusOf(m: MediaItem): ListStatus | undefined {
    return items.find((i) => itemKey(i) === itemKey(m))?.status;
  }

  // Add to a list or move between lists. Never removes.
  async function setStatus(m: MediaItem, status: ListStatus) {
    const existing = items.find((i) => itemKey(i) === itemKey(m));
    if (existing?.status === status) return; // already there, nothing to do

    const snapshot = items;
    setItems(
      existing
        ? items.map((i) => (i === existing ? { ...i, status } : i))
        : [{ ...m, status, addedAt: Date.now() }, ...items]
    );

    try {
      const res = await fetch("/api/db/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemToBody(m, status)),
      });
      if (res.status === 401) return router.push("/login");
      if (!res.ok) throw new Error();
    } catch {
      setItems(snapshot); // roll back
      setError("Couldn't save that change. Try again.");
    }
  }

  // Search result buttons: click the active one again to remove
  function toggle(m: MediaItem, status: ListStatus) {
    return statusOf(m) === status ? remove(m) : setStatus(m, status);
  }
  async function remove(m: MediaItem) {
    const snapshot = items;
    setItems(items.filter((i) => itemKey(i) !== itemKey(m))); // optimistic

    try {
      const params = new URLSearchParams({
        media_type: m.mediaType,
        tmdb_id: String(m.id),
      });
      const res = await fetch(`/api/db/watchlist?${params}`, { method: "DELETE" });
      if (res.status === 401) return router.push("/login");
      if (!res.ok) throw new Error();
    } catch {
      setItems(snapshot); // roll back
      setError("Couldn't remove that item. Try again.");
    }
  }

  return (
    <main className="wl-page">
      <header className="wl-header">
        <h1>Watchlogs</h1>
        <p>Keep track of what you want to see and what you've seen.</p>
        {user != null ? <p>Logged in as: {user.email}</p> : <p></p>}
      </header>

      <div className="wl-layout">
        <div className="wl-main">
          <SearchBar value={query} onChange={setQuery} loading={loading} />
          <SearchResults
            query={query}
            results={results}
            error={error}
            statusOf={statusOf}
            onToggle={toggle}
          />
        </div>
        <aside className="wl-side">
          <ListPanel items={items} onMove={setStatus} onRemove={remove} />
        </aside>
      </div>
    </main>
  );
}