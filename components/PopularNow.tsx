"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { MediaItem } from "@/lib/types";
import { itemKey } from "@/lib/types";

const SHOWN = 10;

interface Props {
  isLogged: (m: MediaItem) => boolean;
  onPick: (m: MediaItem) => void;
}

// Popular titles that aren't in either list yet; picking one searches for it
export default function PopularNow({ isLogged, onPick }: Props) {
  const [feed, setFeed] = useState<MediaItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/feed?page=1")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setFeed(data.results))
      .catch(() => setFailed(true));
  }, []);

  const shown = (feed ?? []).filter((m) => m.poster && !isLogged(m)).slice(0, SHOWN);

  return (
    <section className="wl-popular" aria-labelledby="wl-popular-h">
      <div className="wl-section-head">
        <h2 id="wl-popular-h">Popular now, not in your lists</h2>
        <Link href="/swipe" className="wl-link">Swipe through them</Link>
      </div>
      {failed ? (
        <p className="wl-empty wl-framed">Couldn&apos;t load popular titles.</p>
      ) : feed && shown.length === 0 ? (
        <p className="wl-empty wl-framed">You&apos;ve logged everything popular right now.</p>
      ) : (
        <ul className="wl-posters">
          {(feed ? shown : Array.from({ length: SHOWN }, () => null)).map((m, i) => (
            <li key={m ? itemKey(m) : i}>
              {m ? (
                <button type="button" onClick={() => onPick(m)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.poster!} alt="" loading="lazy" />
                  <strong>{m.title}</strong>
                  <span>{m.mediaType === "tv" ? "Show" : "Movie"}{m.year && `, ${m.year}`}</span>
                </button>
              ) : (
                <div className="wl-poster-loading" aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
