"use client";
import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import ListPanel from "@/components/ListPanel";
import { itemKey, type ListStatus, type LoggedItem, type MediaItem } from "@/lib/types";

const STORAGE_KEY = "watchlog:v1";

export default function Home() {
  // search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // list state
  const [items, setItems] = useState<LoggedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load saved lists once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  // Save lists whenever they change (after the initial load)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  // Debounced search
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

  // Add, move between lists, or remove (if already in that list)
  function toggle(m: MediaItem, status: ListStatus) {
    setItems((prev) => {
      const existing = prev.find((i) => itemKey(i) === itemKey(m));
      if (existing?.status === status) return prev.filter((i) => i !== existing);
      if (existing) return prev.map((i) => (i === existing ? { ...i, status } : i));
      return [{ ...m, status, addedAt: Date.now() }, ...prev];
    });
  }

  function remove(m: MediaItem) {
    setItems((prev) => prev.filter((i) => itemKey(i) !== itemKey(m)));
  }

  return (
    <main className="wl-page">
      <header className="wl-header">
        <h1>Watchlogs</h1>
        <p>Keep track of what you want to see and what you’ve seen.</p>
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
          <ListPanel items={items} onMove={(i, s) => toggle(i, s)} onRemove={remove} />
        </aside>
      </div>
    </main>
  );
}