"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, Heart, MessageCircle, Repeat2 } from "lucide-react";
import { useState } from "react";
import { tweetApi } from "@/lib/api";
import type { Tweet } from "@/lib/types";

interface Props {
  tweet: Tweet;
  queryKey?: string[];
}

export function TweetCard({ tweet, queryKey = ["feed"] }: Props) {
  const qc = useQueryClient();
  const [liked, setLiked] = useState(false);
  const [rtd, setRtd] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const likeMut = useMutation({
    mutationFn: () => (liked ? tweetApi.unlike(tweet.id) : tweetApi.like(tweet.id)),
    onMutate: () => setLiked((v) => !v),
  });

  const rtMut = useMutation({
    mutationFn: () => (rtd ? tweetApi.unretweet(tweet.id) : tweetApi.retweet(tweet.id)),
    onMutate: () => setRtd((v) => !v),
  });

  const bookmarkMut = useMutation({
    mutationFn: () =>
      bookmarked ? tweetApi.unbookmark(tweet.id) : tweetApi.bookmark(tweet.id),
    onMutate: () => setBookmarked((v) => !v),
  });

  const timeAgo = tweet.created_at
    ? formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })
    : "";

  const avatarUrl = tweet.author_handle
    ? `https://unavatar.io/twitter/${tweet.author_handle}`
    : undefined;

  return (
    <article
      className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
      style={{ borderBottom: "1px solid #2f3336" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#080808")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden" style={{ background: "#2f3336" }}>
          {avatarUrl && (
            <img src={avatarUrl} alt={tweet.author_name} className="w-full h-full object-cover" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Author row */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-bold text-sm" style={{ color: "#e7e9ea" }}>
            {tweet.author_name}
          </span>
          {tweet.author_verified && (
            <span style={{ color: "#1d9bf0" }}>✓</span>
          )}
          <span className="text-sm" style={{ color: "#71767b" }}>
            @{tweet.author_handle}
          </span>
          <span style={{ color: "#71767b" }}>·</span>
          <span className="text-sm" style={{ color: "#71767b" }}>
            {timeAgo}
          </span>
        </div>

        {/* Tweet text */}
        <p className="mt-1 text-sm leading-normal whitespace-pre-wrap break-words" style={{ color: "#e7e9ea" }}>
          {tweet.text}
        </p>

        {/* Media */}
        {tweet.media.length > 0 && (
          <div className={`mt-3 grid gap-1 rounded-xl overflow-hidden ${tweet.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {tweet.media.slice(0, 4).map((m, i) => (
              <img
                key={i}
                src={m.preview_url || m.url}
                alt={m.alt_text || ""}
                className="w-full object-cover"
                style={{ maxHeight: tweet.media.length === 1 ? "280px" : "140px" }}
              />
            ))}
          </div>
        )}

        {/* Quoted tweet */}
        {tweet.quoted_tweet && (
          <div
            className="mt-3 p-3 rounded-xl"
            style={{ border: "1px solid #2f3336", background: "#16181c" }}
          >
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs font-bold" style={{ color: "#e7e9ea" }}>
                {tweet.quoted_tweet.author_name}
              </span>
              <span className="text-xs" style={{ color: "#71767b" }}>
                @{tweet.quoted_tweet.author_handle}
              </span>
            </div>
            <p className="text-xs" style={{ color: "#e7e9ea" }}>
              {tweet.quoted_tweet.text.slice(0, 200)}
              {tweet.quoted_tweet.text.length > 200 ? "..." : ""}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 max-w-xs">
          {/* Reply */}
          <button className="flex items-center gap-1" style={{ color: "#71767b" }}>
            <MessageCircle size={16} />
            <span className="text-xs">{tweet.engagement.replies > 0 ? tweet.engagement.replies : ""}</span>
          </button>

          {/* Retweet */}
          <button
            onClick={() => rtMut.mutate()}
            className="flex items-center gap-1 transition-colors"
            style={{ color: rtd ? "#00ba7c" : "#71767b" }}
          >
            <Repeat2 size={16} />
            <span className="text-xs">
              {(tweet.engagement.retweets + (rtd ? 1 : 0)) || ""}
            </span>
          </button>

          {/* Like */}
          <button
            onClick={() => likeMut.mutate()}
            className="flex items-center gap-1 transition-colors"
            style={{ color: liked ? "#f91880" : "#71767b" }}
          >
            <Heart size={16} fill={liked ? "#f91880" : "none"} />
            <span className="text-xs">
              {(tweet.engagement.likes + (liked ? 1 : 0)) || ""}
            </span>
          </button>

          {/* Bookmark */}
          <button
            onClick={() => bookmarkMut.mutate()}
            className="flex items-center gap-1 transition-colors"
            style={{ color: bookmarked ? "#1d9bf0" : "#71767b" }}
          >
            <Bookmark size={16} fill={bookmarked ? "#1d9bf0" : "none"} />
          </button>

          {/* Views */}
          {tweet.engagement.views > 0 && (
            <span className="text-xs" style={{ color: "#71767b" }}>
              {tweet.engagement.views.toLocaleString()} views
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
