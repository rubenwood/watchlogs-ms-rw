"use client";
import MediaCard from "./MediaCard";
import type { ListStatus, MediaItem } from "@/lib/types";
import { itemKey } from "@/lib/types";

interface Props {
  query: string;
  results: MediaItem[];
  error: string | null;
  statusOf: (m: MediaItem) => ListStatus | undefined;
  onToggle: (m: MediaItem, s: ListStatus) => void;
}

export default function SearchResults({ query, results, error, statusOf, onToggle }: Props) {
  if (error) return <p className="wl-empty" role="alert">{error}</p>;
  if (!query.trim()) return <p className="wl-empty">Search for a title to add it to a list.</p>;
  if (results.length === 0) return <p className="wl-empty">No results for “{query}”. Try a different spelling.</p>;

  return (
    <ul className="wl-grid">
      {results.map((m) => (
        <MediaCard
          key={itemKey(m)}
          item={m}
          status={statusOf(m)}
          onToggle={(s) => onToggle(m, s)}
        />
      ))}
    </ul>
  );
}