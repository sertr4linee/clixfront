"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  IconHome, IconSearch, IconBookmark,
  IconList, IconCalendar, IconMessage,
  IconAnalytics, IconX,
} from "./icons";

const NAV = [
  { href: "/feed",      Icon: IconHome,      label: "Home" },
  { href: "/search",    Icon: IconSearch,    label: "Explore" },
  { href: "/bookmarks", Icon: IconBookmark,  label: "Bookmarks" },
  { href: "/lists",     Icon: IconList,      label: "Lists" },
  { href: "/scheduled", Icon: IconCalendar,  label: "Scheduled" },
  { href: "/dms",       Icon: IconMessage,   label: "Messages" },
  { href: "/analytics", Icon: IconAnalytics, label: "Analytics" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[72px] xl:w-64 flex-shrink-0 flex flex-col items-center xl:items-start py-3 px-2 xl:px-4 sticky top-0 h-screen">
      {/* X logo */}
      <Link
        href="/feed"
        className="flex items-center justify-center xl:justify-start mb-2 p-3 rounded-full hover:bg-white/10 transition-colors"
      >
        <IconX size={28} />
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 w-full">
        {NAV.map(({ href, Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-4 px-3 py-3 rounded-full transition-colors group w-fit xl:w-full",
                "hover:bg-white/10",
                active ? "text-white" : "text-zinc-400 hover:text-white"
              )}
            >
              <Icon
                size={26}
                className={cn("flex-shrink-0", active && "drop-shadow-sm")}
              />
              <span
                className={cn(
                  "hidden xl:block text-[19px] leading-none",
                  active ? "font-bold" : "font-normal"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

