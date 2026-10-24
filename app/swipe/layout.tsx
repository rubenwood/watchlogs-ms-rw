import type { Metadata } from "next";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "Swipe · Watchlogs",
};

export default function SwipeLayout({ children }: LayoutProps<"/swipe">) {
  return (
    <>
      <TopBar />
      <main className="wl-swipe-page">{children}</main>
    </>
  );
}
