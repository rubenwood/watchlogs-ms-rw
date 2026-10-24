"use client";
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import type { MediaItem } from "@/lib/types";
import { itemKey } from "@/lib/types";

export type Side = "left" | "right";
export type Tone = "watch" | "watched" | "will" | "wont";

export interface SideOption {
  label: string;
  tone: Tone;
}

interface Props {
  items: MediaItem[]; // items[0] is the top card
  left: SideOption;
  right: SideOption;
  onDecide: (item: MediaItem, side: Side) => void;
  onUndo: (() => void) | null; // null disables the button
  empty: ReactNode;
}

const THRESHOLD = 110; // px of drag before letting go counts as a swipe
const EXIT_MS = 220; // keep in sync with .wl-swipe-card transition

export default function SwipeDeck({ items, left, right, onDecide, onUndo, empty }: Props) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<Side | null>(null);
  const startX = useRef(0);

  const top = items[0];
  const next = items[1];

  function decide(side: Side) {
    if (!top || exiting) return;
    setExiting(side);
    setTimeout(() => {
      onDecide(top, side);
      setExiting(null);
      setDx(0);
    }, EXIT_MS);
  }

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") decide("left");
    if (e.key === "ArrowRight") decide("right");
  });
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (exiting) return;
    startX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragging) setDx(e.clientX - startX.current);
  }
  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(dx) > THRESHOLD) decide(dx > 0 ? "right" : "left");
    else setDx(0);
  }

  if (!top) return <div className="wl-swipe-status">{empty}</div>;

  // -1..1, how far the card leans toward a side; drives the stamps
  const lean = exiting ? (exiting === "right" ? 1 : -1) : Math.max(-1, Math.min(1, dx / THRESHOLD));
  const x = exiting ? lean * 600 : dx;

  return (
    <div className="wl-deck">
      <div className="wl-deck-stack">
        {next && (
          <div key={itemKey(next)} className="wl-swipe-card wl-swipe-card--next" aria-hidden="true">
            <CardFace item={next} />
          </div>
        )}
        <div
          key={itemKey(top)}
          className={`wl-swipe-card${dragging ? " is-dragging" : ""}`}
          style={{ transform: `translateX(${x}px) rotate(${x / 18}deg)`, opacity: exiting ? 0 : 1 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <CardFace item={top} />
          <span className={`wl-stamp wl-stamp-right wl-tone-${right.tone}`} style={{ opacity: Math.max(0, lean) }}>
            {right.label}
          </span>
          <span className={`wl-stamp wl-stamp-left wl-tone-${left.tone}`} style={{ opacity: Math.max(0, -lean) }}>
            {left.label}
          </span>
        </div>
      </div>
      <p className="wl-sr" aria-live="polite">{top.title}</p>

      <div className="wl-deck-actions">
        <button className={`wl-swipe-btn wl-tone-${left.tone}`} onClick={() => decide("left")} disabled={!!exiting}>
          ← {left.label}
        </button>
        <button className="wl-swipe-btn wl-swipe-undo" onClick={onUndo ?? undefined} disabled={!onUndo || !!exiting}>
          Undo
        </button>
        <button className={`wl-swipe-btn wl-tone-${right.tone}`} onClick={() => decide("right")} disabled={!!exiting}>
          {right.label} →
        </button>
      </div>
      <p className="wl-deck-hint">Drag the card, or use the ← and → keys.</p>
    </div>
  );
}

function CardFace({ item }: { item: MediaItem }) {
  return (
    <>
      {item.poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.poster} alt="" className="wl-swipe-poster" draggable={false} />
      ) : (
        <div className="wl-swipe-poster" aria-hidden="true" />
      )}
      <div className="wl-swipe-info">
        <h2>{item.title}</h2>
        <p className="wl-swipe-meta">
          {item.mediaType === "tv" ? "Show" : "Movie"}
          {item.year && `, ${item.year}`}
        </p>
        {item.overview && <p className="wl-swipe-overview">{item.overview}</p>}
      </div>
    </>
  );
}
