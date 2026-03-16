"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bookmark,
  Calendar,
  Home,
  List,
  Mail,
  Search,
  Settings,
} from "lucide-react";
import { TweetComposerButton } from "@/components/tweet/TweetComposerButton";

const NAV = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/lists", icon: List, label: "Lists" },
  { href: "/dm", icon: Mail, label: "Messages" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col py-4 px-3 border-r"
      style={{ background: "#000", borderColor: "#2f3336" }}
    >
      {/* Logo */}
      <div className="px-3 mb-6">
        <span className="text-xl font-bold" style={{ color: "#e7e9ea" }}>
          clix
        </span>
        <span className="text-sm ml-1" style={{ color: "#71767b" }}>
          web
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 px-3 py-3 rounded-full transition-colors"
              style={{
                color: active ? "#e7e9ea" : "#71767b",
                background: active ? "#1d9bf01a" : "transparent",
                fontWeight: active ? 700 : 400,
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "#ffffff0d";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon size={22} />
              <span className="text-base">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Compose button */}
      <div className="px-1 mt-4">
        <TweetComposerButton />
      </div>
    </aside>
  );
}
