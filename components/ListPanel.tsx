"use client";
import { useState } from "react";
import type { ListStatus, LoggedItem } from "@/lib/types";
import { itemKey } from "@/lib/types";

interface Props {
  items: LoggedItem[];
  onMove: (item: LoggedItem, status: ListStatus) => void;
  onRemove: (item: LoggedItem) => void;
}

export default function ListPanel({ items, onMove, onRemove }: Props) {
  const [tab, setTab] = useState<ListStatus>("watch");
  const shown = items.filter((i) => i.status === tab);
  const count = (s: ListStatus) => items.filter((i) => i.status === s).length;
  const other: ListStatus = tab === "watch" ? "watched" : "watch";

  return (
    <section className="wl-panel" aria-label="Your lists">
      <div className="wl-tabs" role="tablist">
        {(["watch", "watched"] as const).map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={tab === s}
            className={`wl-tab wl-tab-${s}`}
            onClick={() => setTab(s)}
          >
            {s === "watch" ? "To watch" : "Watched"} <span>{count(s)}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="wl-empty">
          {tab === "watch" ? "Nothing queued yet. Search and add a title." : "Nothing marked as watched yet."}
        </p>
      ) : (
        <ul className="wl-rows">
          {shown.map((i) => (
            <li key={itemKey(i)} className="wl-row">
              {i.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.poster} alt="" />
              ) : (
                <div className="wl-noposter-sm" aria-hidden="true" />
              )}
              <div className="wl-row-text">
                <strong>{i.title}</strong>
                <span>{i.type === "tv" ? "Show" : "Movie"}{i.year && `, ${i.year}`}</span>
              </div>
              <button className="wl-link" onClick={() => onMove(i, other)}>
                {tab === "watch" ? "Mark watched" : "Move to watch"}
              </button>
              <button className="wl-link wl-danger" onClick={() => onRemove(i)} aria-label={`Remove ${i.title}`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}