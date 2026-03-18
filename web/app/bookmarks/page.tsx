"use client";

import { useEffect, useRef } from "react";
import { Bookmark } from "lucide-react";
import { useBookmarks } from "@/lib/hooks/use-mcp";
import { TweetCard } from "@/components/tweet/tweet-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tweet } from "@/types/twitter";

export default function BookmarksPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useBookmarks();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tweets = data?.pages.flatMap((p) => p.tweets) ?? [];

  return (
    <div>
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/10 px-4 h-14 flex items-center">
        <h1 className="text-xl font-bold">Bookmarks</h1>
      </div>

      {isLoading && (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 px-4 py-3 border-b border-white/10">
            <Skeleton className="w-10 h-10 rounded-full bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 bg-zinc-800" />
              <Skeleton className="h-4 w-full bg-zinc-800" />
            </div>
          </div>
        ))
      )}

      {!isLoading && tweets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Bookmark size={40} className="mb-4 opacity-30" />
          <p className="font-semibold text-white">Save posts for later</p>
          <p className="text-sm mt-1">Bookmarked posts will appear here.</p>
        </div>
      )}

      {tweets.map((tweet: Tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}

      <div ref={bottomRef} className="py-4 flex justify-center">
        {isFetchingNextPage && <Skeleton className="h-4 w-20 bg-zinc-800" />}
        {!hasNextPage && tweets.length > 0 && (
          <p className="text-zinc-600 text-sm">End of bookmarks</p>
        )}
      </div>
    </div>
  );
}
