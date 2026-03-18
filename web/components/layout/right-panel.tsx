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
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4">
        <h2 className="font-bold text-base text-gray-900 mb-4">Trends</h2>

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-24 bg-gray-100" />
                <Skeleton className="h-4 w-36 bg-gray-100" />
                <Skeleton className="h-3 w-20 bg-gray-100" />
              </div>
            ))}
          </div>
        )}

        {trends?.map((trend, i) => (
          <div
            key={i}
            className="py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
          >
            {trend.category && (
              <p className="text-xs text-gray-400">
                {trend.category} · Trending
              </p>
            )}
            <p className="font-semibold text-sm text-gray-900">{trend.name}</p>
            {trend.tweet_count && (
              <p className="text-xs text-gray-400">
                {Number(trend.tweet_count).toLocaleString()} posts
              </p>
            )}
          </div>
        ))}

        {!isLoading && !trends?.length && (
          <p className="text-gray-400 text-sm">No trends available</p>
        )}
      </div>
    </aside>
  );
}
