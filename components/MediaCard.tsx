"use client";
import type { ListStatus, MediaItem } from "@/lib/types";

interface Props {
  item: MediaItem;
  status?: ListStatus;
  onToggle: (status: ListStatus) => void;
}

export default function MediaCard({ item, status, onToggle }: Props) {
  return (
    <li className="wl-card">
      {item.poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.poster} alt="" className="wl-poster" loading="lazy" />
      ) : (
        <div className="wl-poster wl-noposter" aria-hidden="true">No poster</div>
      )}
      <div className="wl-body">
        <h3>{item.title}</h3>
        <p className="wl-meta">
          {item.mediaType === "tv" ? "Show" : "Movie"}
          {item.year && `, ${item.year}`}
        </p>
        {item.overview && <p className="wl-overview">{item.overview}</p>}
        <div className="wl-actions">
          <button
            className="wl-btn wl-watch"
            aria-pressed={status === "watch"}
            onClick={() => onToggle("watch")}
          >
            {status === "watch" ? "On watch list" : "Add to watch"}
          </button>
          <button
            className="wl-btn wl-watched"
            aria-pressed={status === "watched"}
            onClick={() => onToggle("watched")}
          >
            {status === "watched" ? "Watched" : "Mark watched"}
          </button>
        </div>
      </div>
    </li>
  );
}