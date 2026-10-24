"use client";
import type { MediaItem } from "@/lib/types";
import { itemKey } from "@/lib/types";

// The cards waiting under the top one
export default function NextUp({ items }: { items: MediaItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="wl-next" aria-labelledby="wl-next-h">
      <h2 id="wl-next-h">Next up</h2>
      <ul>
        {items.map((m) => (
          <li key={itemKey(m)}>
            {m.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.poster} alt="" />
            ) : (
              <div className="wl-noposter-sm" aria-hidden="true">{m.mediaType === "tv" ? "TV" : "Film"}</div>
            )}
            <strong>{m.title}</strong>
            <span>{m.mediaType === "tv" ? "Show" : "Movie"}{m.year && `, ${m.year}`}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
