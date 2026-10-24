import type { Metadata } from "next";
import SwipeNav from "@/components/SwipeNav";

export const metadata: Metadata = {
  title: "Swipe · Watchlogs",
};

export default function SwipeLayout({ children }: LayoutProps<"/swipe">) {
  return (
    <main className="wl-swipe-page">
      <SwipeNav />
      {children}
    </main>
  );
}
