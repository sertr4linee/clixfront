"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { feedApi } from "@/lib/api";
import { TweetCard } from "@/components/tweet/TweetCard";

export default function FeedPage() {
  const [tab, setTab] = useState<"for-you" | "following">("for-you");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["feed", tab],
      queryFn: ({ pageParam }) => feedApi.getFeed(tab, 20, pageParam as string | undefined),
      getNextPageParam: (last) => (last.has_more ? last.cursor_bottom : undefined),
      initialPageParam: undefined as string | undefined,
    });

  const tweets = data?.pages.flatMap((p) => p.tweets) ?? [];

  return (
    <div className="max-w-xl mx-auto">
      {/* Tabs */}
      <div
        className="flex sticky top-0 z-10 backdrop-blur-sm"
        style={{ borderBottom: "1px solid #2f3336", background: "rgba(0,0,0,0.8)" }}
      >
        {(["for-you", "following"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-4 text-sm font-medium relative transition-colors"
            style={{ color: tab === t ? "#e7e9ea" : "#71767b" }}
          >
            {t === "for-you" ? "For you" : "Following"}
            {tab === t && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full"
                style={{ background: "#1d9bf0" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Skeletons */}
      {isLoading && (
        <div className="flex flex-col">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-4" style={{ borderBottom: "1px solid #2f3336" }}>
              <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: "#2f3336" }} />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 rounded animate-pulse w-32" style={{ background: "#2f3336" }} />
                <div className="h-3 rounded animate-pulse w-full" style={{ background: "#2f3336" }} />
                <div className="h-3 rounded animate-pulse w-3/4" style={{ background: "#2f3336" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="p-8 text-center" style={{ color: "#71767b" }}>
          Failed to load feed. Make sure the clix server is running.
        </div>
      )}

      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} queryKey={["feed", tab]} />
      ))}

      {hasNextPage && (
        <div className="p-4 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-4 py-2 rounded-full text-sm transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: "#1d9bf0", color: "#fff" }}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
