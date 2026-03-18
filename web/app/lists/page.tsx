"use client";

import { useState, useEffect, useRef } from "react";
import { List } from "lucide-react";
import { useLists, useListTimeline } from "@/lib/hooks/use-mcp";
import { TweetCard } from "@/components/tweet/tweet-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { TwitterList, Tweet } from "@/types/twitter";

export default function ListsPage() {
  const { data: lists, isLoading: listsLoading } = useLists();
  const [selectedList, setSelectedList] = useState<TwitterList | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading: timelineLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useListTimeline(selectedList?.id ?? "");

  // Auto-select first list
  useEffect(() => {
    if (lists?.length && !selectedList) setSelectedList(lists[0]);
  }, [lists, selectedList]);

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
    <div className="flex h-screen">
      {/* Lists sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-gray-100 flex flex-col">
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-100 px-4 h-14 flex items-center">
          <h1 className="text-xl font-bold">Lists</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {listsLoading && (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-100">
                <Skeleton className="h-4 w-32 bg-gray-100" />
              </div>
            ))
          )}

          {lists?.map((list: TwitterList) => (
            <button
              key={list.id}
              onClick={() => setSelectedList(list)}
              className={cn(
                "w-full text-left p-4 border-b border-white/10 hover:bg-gray-50 transition-colors",
                selectedList?.id === list.id && "bg-blue-50 border-l-2 border-l-blue-500"
              )}
            >
              <p className="font-semibold text-sm">{list.name}</p>
              {list.description && (
                <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{list.description}</p>
              )}
              <p className="text-gray-300 text-xs mt-1">{list.member_count} members</p>
            </button>
          ))}

          {!listsLoading && !lists?.length && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 px-4 text-center">
              <List size={32} className="mb-3 opacity-30" />
              <p className="text-sm">No lists yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        {selectedList && (
          <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-100 px-4 h-14 flex items-center">
            <h2 className="font-bold">{selectedList.name}</h2>
          </div>
        )}

        {timelineLoading && selectedList && (
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

        {!selectedList && !listsLoading && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Select a list to view its timeline</p>
          </div>
        )}
      </div>
    </div>
  );
}
