"use client";

import { useState, useEffect, useRef } from "react";
import { useFeed } from "@/lib/hooks/use-mcp";
import { TweetCard } from "@/components/tweet/tweet-card";
import { ComposeBox } from "@/components/tweet/compose-box";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tweet } from "@/types/twitter";

function TweetSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3 border-b border-white/10">
      <Skeleton className="w-10 h-10 rounded-full bg-zinc-800" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32 bg-zinc-800" />
        <Skeleton className="h-4 w-full bg-zinc-800" />
        <Skeleton className="h-4 w-3/4 bg-zinc-800" />
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [tab, setTab] = useState<"for-you" | "following">("for-you");
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed(tab);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Infinite scroll
  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tweets = data?.pages.flatMap((p) => p.tweets) ?? [];

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/10">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="w-full bg-transparent h-14 rounded-none gap-0">
            <TabsTrigger
              value="for-you"
              className="flex-1 h-full rounded-none text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-sky-400 data-[state=active]:text-white data-[state=inactive]:text-zinc-500"
            >
              For you
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 h-full rounded-none text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-sky-400 data-[state=active]:text-white data-[state=inactive]:text-zinc-500"
            >
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Compose */}
      <ComposeBox />

      {/* Tweets */}
      {isLoading && Array.from({ length: 5 }).map((_, i) => <TweetSkeleton key={i} />)}

      {tweets.map((tweet: Tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}

      {/* Infinite scroll sentinel */}
      <div ref={bottomRef} className="py-4 flex justify-center">
        {isFetchingNextPage && <TweetSkeleton />}
        {!hasNextPage && tweets.length > 0 && (
          <p className="text-zinc-600 text-sm">You&apos;re all caught up</p>
        )}
      </div>
    </div>
  );
}
