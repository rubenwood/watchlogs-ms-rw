"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/", label: "Lists" },
  { href: "/swipe", label: "Discover" },
  { href: "/swipe/unseen", label: "Sort to-watch" },
];

export default function TopBar() {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setEmail(session?.user.email ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <header className="wl-bar">
      <div className="wl-bar-inner">
        <Link href="/" className="wl-brand">
          <Mark />
          Watchlogs
        </Link>
        <nav className="wl-nav" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        {email && <span className="wl-account" title="Signed in">{email}</span>}
      </div>
    </header>
  );
}

// A strip of film: two frames with sprocket holes
export function Mark() {
  return (
    <svg className="wl-mark" viewBox="0 0 20 20" aria-hidden="true">
      <rect x="2" y="2" width="16" height="16" rx="3" fill="var(--accent)" />
      <rect x="6" y="5" width="8" height="4" rx="1" fill="var(--ground)" />
      <rect x="6" y="11" width="8" height="4" rx="1" fill="var(--ground)" />
      <rect x="3.5" y="5" width="1.5" height="1.5" fill="var(--ground)" />
      <rect x="3.5" y="9.25" width="1.5" height="1.5" fill="var(--ground)" />
      <rect x="3.5" y="13.5" width="1.5" height="1.5" fill="var(--ground)" />
      <rect x="15" y="5" width="1.5" height="1.5" fill="var(--ground)" />
      <rect x="15" y="9.25" width="1.5" height="1.5" fill="var(--ground)" />
      <rect x="15" y="13.5" width="1.5" height="1.5" fill="var(--ground)" />
    </svg>
  );
}
