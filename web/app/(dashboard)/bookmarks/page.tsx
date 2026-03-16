"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { feedApi } from "@/lib/api";
import { TweetCard } from "@/components/tweet/TweetCard";

export default function BookmarksPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["bookmarks"],
    queryFn: ({ pageParam }) => feedApi.getBookmarks(20, pageParam as string | undefined),
    getNextPageParam: (last) => (last.has_more ? last.cursor_bottom : undefined),
    initialPageParam: undefined as string | undefined,
  });

  const tweets = data?.pages.flatMap((p) => p.tweets) ?? [];

  return (
    <div className="max-w-xl mx-auto">
      <div
        className="sticky top-0 z-10 px-4 py-4 font-bold text-lg backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.8)", borderBottom: "1px solid #2f3336", color: "#e7e9ea" }}
      >
        Bookmarks
      </div>

      {isLoading && (
        <div className="p-4 text-center" style={{ color: "#71767b" }}>Loading...</div>
      )}

      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} queryKey={["bookmarks"]} />
      ))}

      {hasNextPage && (
        <div className="p-4 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-4 py-2 rounded-full text-sm"
            style={{ background: "#1d9bf0", color: "#fff" }}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      )}

      {!isLoading && tweets.length === 0 && (
        <div className="p-8 text-center" style={{ color: "#71767b" }}>No bookmarks yet.</div>
      )}
    </div>
  );
}
