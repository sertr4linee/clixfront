"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Bookmark,
  List,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
  { href: "/lists", icon: List, label: "Lists" },
  { href: "/scheduled", icon: Calendar, label: "Scheduled" },
  { href: "/dms", icon: MessageCircle, label: "Messages" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-20 xl:w-64 flex-shrink-0 flex flex-col items-center xl:items-start py-4 px-3 xl:px-6 sticky top-0 h-screen">
      {/* Logo */}
      <Link
        href="/feed"
        className="flex items-center justify-center xl:justify-start mb-4 p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <span className="text-2xl font-black text-white">𝕏</span>
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 w-full">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-4 px-3 py-3 rounded-full text-xl transition-colors",
                "hover:bg-white/10",
                active ? "font-bold text-white" : "text-zinc-400"
              )}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              <span className="hidden xl:block text-base">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
