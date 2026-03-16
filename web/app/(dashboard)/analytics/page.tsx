"use client";

import { useQuery } from "@tanstack/react-query";
import { Bookmark, Eye, Heart, MessageCircle, Repeat2 } from "lucide-react";
import { authApi } from "@/lib/api";
import type { Tweet } from "@/lib/types";

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-xl"
      style={{ background: "#16181c", border: "1px solid #2f3336" }}
    >
      <div className="p-2 rounded-lg" style={{ background: color + "1a" }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-bold" style={{ color: "#e7e9ea" }}>
          {value.toLocaleString()}
        </p>
        <p className="text-xs" style={{ color: "#71767b" }}>{label}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: auth } = useQuery({ queryKey: ["auth"], queryFn: authApi.status });
  const handle = auth?.account;

  const { data: timeline, isLoading } = useQuery({
    queryKey: ["user-tweets-analytics", handle],
    queryFn: () =>
      fetch(`/api/user/${handle}/tweets?count=50`).then((r) => r.json()),
    enabled: !!handle,
  });

  const tweets: Tweet[] = timeline?.tweets ?? [];

  const totals = tweets.reduce(
    (acc, t) => ({
      likes: acc.likes + t.engagement.likes,
      retweets: acc.retweets + t.engagement.retweets,
      replies: acc.replies + t.engagement.replies,
      bookmarks: acc.bookmarks + t.engagement.bookmarks,
      views: acc.views + t.engagement.views,
    }),
    { likes: 0, retweets: 0, replies: 0, bookmarks: 0, views: 0 }
  );

  const topTweets = [...tweets]
    .sort((a, b) => (b.engagement.likes + b.engagement.retweets) - (a.engagement.likes + a.engagement.retweets))
    .slice(0, 5);

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="sticky top-0 z-10 px-4 py-4 font-bold text-lg backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.8)", borderBottom: "1px solid #2f3336", color: "#e7e9ea" }}
      >
        Analytics
        {handle && <span className="ml-2 text-sm font-normal" style={{ color: "#71767b" }}>@{handle}</span>}
      </div>

      <div className="p-4">
        {!handle && (
          <div className="p-8 text-center" style={{ color: "#71767b" }}>
            Connect your account to see analytics.
          </div>
        )}

        {handle && isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "#16181c" }} />
            ))}
          </div>
        )}

        {tweets.length > 0 && (
          <>
            <p className="text-xs mb-3" style={{ color: "#71767b" }}>
              Last {tweets.length} tweets
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <StatCard icon={Eye} label="Total views" value={totals.views} color="#1d9bf0" />
              <StatCard icon={Heart} label="Total likes" value={totals.likes} color="#f91880" />
              <StatCard icon={Repeat2} label="Total retweets" value={totals.retweets} color="#00ba7c" />
              <StatCard icon={MessageCircle} label="Total replies" value={totals.replies} color="#1d9bf0" />
              <StatCard icon={Bookmark} label="Total bookmarks" value={totals.bookmarks} color="#ffd400" />
            </div>

            <h2 className="font-bold mb-3" style={{ color: "#e7e9ea" }}>Top performing tweets</h2>
            <div className="space-y-2">
              {topTweets.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl"
                  style={{ background: "#16181c", border: "1px solid #2f3336" }}
                >
                  <p className="text-sm mb-2" style={{ color: "#e7e9ea" }}>
                    {t.text.slice(0, 120)}{t.text.length > 120 ? "…" : ""}
                  </p>
                  <div className="flex gap-3 text-xs" style={{ color: "#71767b" }}>
                    <span>❤️ {t.engagement.likes}</span>
                    <span>🔁 {t.engagement.retweets}</span>
                    <span>👁 {t.engagement.views.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
