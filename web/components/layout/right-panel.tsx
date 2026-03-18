"use client";

import { usePathname } from "next/navigation";
import { useTrending } from "@/lib/hooks/use-mcp";
import { Skeleton } from "@/components/ui/skeleton";

const HIDDEN_ROUTES = ["/automations"];

export function RightPanel() {
  const pathname = usePathname();
  const { data: trends, isLoading } = useTrending();

  if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null;

  return (
    <aside className="hidden lg:flex w-80 xl:w-96 flex-shrink-0 flex-col py-4 px-4 sticky top-0 h-screen overflow-y-auto">
      <div className="bg-zinc-900 rounded-2xl p-4">
        <h2 className="font-bold text-xl mb-4">Trends</h2>

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-24 bg-zinc-800" />
                <Skeleton className="h-4 w-36 bg-zinc-800" />
                <Skeleton className="h-3 w-20 bg-zinc-800" />
              </div>
            ))}
          </div>
        )}

        {trends?.map((trend, i) => (
          <div
            key={i}
            className="py-3 border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/5 rounded-lg px-2 -mx-2 transition-colors"
          >
            {trend.category && (
              <p className="text-xs text-zinc-500">
                {trend.category} · Trending
              </p>
            )}
            <p className="font-bold text-sm">{trend.name}</p>
            {trend.tweet_count && (
              <p className="text-xs text-zinc-500">
                {Number(trend.tweet_count).toLocaleString()} posts
              </p>
            )}
          </div>
        ))}

        {!isLoading && !trends?.length && (
          <p className="text-zinc-500 text-sm">No trends available</p>
        )}
      </div>
    </aside>
  );
}
