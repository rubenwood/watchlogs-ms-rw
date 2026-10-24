"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/swipe", label: "Discover" },
  { href: "/swipe/unseen", label: "Sort to-watch" },
];

export default function SwipeNav() {
  const pathname = usePathname();
  return (
    <header className="wl-swipe-header">
      <Link href="/" className="wl-swipe-home">Watchlogs</Link>
      <nav className="wl-swipe-nav" aria-label="Swipe modes">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} aria-current={pathname === t.href ? "page" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
