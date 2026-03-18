"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useSearch } from "@/lib/hooks/use-mcp";
import { TweetCard } from "@/components/tweet/tweet-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tweet } from "@/types/twitter";

const TYPES = ["Top", "Latest", "Photos", "Videos"] as const;
type SearchType = (typeof TYPES)[number];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [type, setType] = useState<SearchType>("Top");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearch(debouncedQuery, type);

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
      {/* Search bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 p-3">
        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
            autoFocus
          />
        </div>
      </div>

      {/* Type tabs */}
      {debouncedQuery && (
        <div className="border-b border-gray-100">
          <Tabs value={type} onValueChange={(v) => setType(v as SearchType)}>
            <TabsList className="w-full bg-transparent h-12 rounded-none gap-0">
              {TYPES.map((t) => (
                <TabsTrigger
                  key={t}
                  value={t}
                  className="flex-1 h-full rounded-none text-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-400"
                >
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      {!debouncedQuery && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Search size={40} className="mb-4 opacity-30" />
          <p>Search for posts, people, or topics</p>
        </div>
      )}

      {isLoading && debouncedQuery && (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 px-4 py-3 border-b border-gray-100">
            <Skeleton className="w-10 h-10 rounded-full bg-gray-100" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 bg-gray-100" />
              <Skeleton className="h-4 w-full bg-gray-100" />
            </div>
          </div>
        ))
      )}

      {tweets.map((tweet: Tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}

      <div ref={bottomRef} className="py-4 flex justify-center">
        {isFetchingNextPage && <Skeleton className="h-4 w-20 bg-gray-100" />}
      </div>
    </div>
  );
}
