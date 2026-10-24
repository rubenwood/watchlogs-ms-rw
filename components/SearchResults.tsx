"use client";
import type { ReactNode } from "react";
import MediaCard from "./MediaCard";
import type { ListStatus, MediaItem } from "@/lib/types";
import { itemKey } from "@/lib/types";

interface Props {
  query: string;
  results: MediaItem[];
  error: string | null;
  statusOf: (m: MediaItem) => ListStatus | undefined;
  onToggle: (m: MediaItem, s: ListStatus) => void;
  idle: ReactNode; // shown before anything is typed
}

export default function SearchResults({ query, results, error, statusOf, onToggle, idle }: Props) {
  if (error) return <p className="wl-error" role="alert">{error}</p>;
  if (!query.trim()) return idle;
  if (results.length === 0) return <p className="wl-empty">No results for “{query}”. Try a different spelling.</p>;

  return (
    <>
      <p className="wl-count">{results.length} {results.length === 1 ? "result" : "results"}</p>
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
    </>
  );
}
