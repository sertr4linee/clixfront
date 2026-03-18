"use client";

import { useState } from "react";
import { Heart, Repeat2, MessageCircle, Bookmark, MoreHorizontal, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tweet } from "@/types/twitter";
import { useLike, useRetweet, useBookmarkToggle } from "@/lib/hooks/use-mcp";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n > 0 ? String(n) : "";
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Deterministic avatar color from a string */
function avatarColor(s: string): string {
  const colors = [
    "bg-sky-500", "bg-violet-500", "bg-pink-500",
    "bg-emerald-500", "bg-amber-500", "bg-rose-500",
    "bg-indigo-500", "bg-teal-500",
  ];
  let hash = 0;
  for (const c of s) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ name, handle, size = "md" }: { name: string; handle: string; size?: "sm" | "md" }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : handle.slice(0, 2).toUpperCase();
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={cn("rounded-full flex items-center justify-center font-bold flex-shrink-0 text-white", sz, avatarColor(handle))}>
      {initials}
    </div>
  );
}

interface TweetCardProps {
  tweet: Tweet;
  onReply?: (tweet: Tweet) => void;
}

export function TweetCard({ tweet, onReply }: TweetCardProps) {
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const likeMutation = useLike();
  const retweetMutation = useRetweet();
  const bookmarkMutation = useBookmarkToggle();

  const handleLike = () => {
    setLiked((v) => !v);
    likeMutation.mutate({ id: tweet.id, liked });
  };
  const handleRetweet = () => {
    setRetweeted((v) => !v);
    retweetMutation.mutate({ id: tweet.id, retweeted });
  };
  const handleBookmark = () => {
    setBookmarked((v) => !v);
    bookmarkMutation.mutate({ id: tweet.id, bookmarked });
  };

  return (
    <article className="flex gap-3 px-4 py-3 border-b border-white/10 hover:bg-white/[0.02] transition-colors cursor-pointer group">
      {/* Retweet label */}
      {tweet.is_retweet && (
        <div className="col-span-2 flex items-center gap-1 text-xs text-zinc-500 mb-1 -mt-1 pl-12 w-full">
          <Repeat2 size={12} />
          <span>{tweet.retweeted_by} reposted</span>
        </div>
      )}

      {/* Avatar */}
      <a href={`/${tweet.author_handle}`} onClick={(e) => e.stopPropagation()}>
        <Avatar name={tweet.author_name} handle={tweet.author_handle} />
      </a>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-1 flex-wrap">
          <a
            href={`/${tweet.author_handle}`}
            className="font-bold hover:underline truncate max-w-[140px]"
            onClick={(e) => e.stopPropagation()}
          >
            {tweet.author_name}
          </a>
          {tweet.author_verified && (
            <BadgeCheck size={14} className="text-sky-400 flex-shrink-0" />
          )}
          <span className="text-zinc-500 text-sm truncate">
            @{tweet.author_handle}
          </span>
          <span className="text-zinc-600 text-sm">·</span>
          <span className="text-zinc-500 text-sm flex-shrink-0">
            {formatTime(tweet.created_at)}
          </span>
          <button className="ml-auto opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all">
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Reply context */}
        {tweet.reply_to_handle && (
          <p className="text-zinc-500 text-sm">
            Replying to{" "}
            <span className="text-sky-400">@{tweet.reply_to_handle}</span>
          </p>
        )}

        {/* Text */}
        <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {tweet.text}
        </p>

        {/* Media */}
        {tweet.media.length > 0 && (
          <div className={cn("mt-3 rounded-2xl overflow-hidden grid gap-0.5",
            tweet.media.length === 1 ? "grid-cols-1" : "grid-cols-2"
          )}>
            {tweet.media.map((m, i) => (
              m.type === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={m.url}
                  alt={m.alt_text ?? ""}
                  className="w-full object-cover max-h-72 rounded-lg"
                />
              ) : (
                <video
                  key={i}
                  src={m.url}
                  poster={m.preview_url ?? undefined}
                  controls
                  className="w-full rounded-lg max-h-72"
                />
              )
            ))}
          </div>
        )}

        {/* Quoted tweet */}
        {tweet.quoted_tweet && (
          <div className="mt-3 border border-white/15 rounded-2xl p-3">
            <div className="flex items-center gap-1 text-sm font-bold">
              <Avatar name={tweet.quoted_tweet.author_name} handle={tweet.quoted_tweet.author_handle} size="sm" />
              <span className="ml-1">{tweet.quoted_tweet.author_name}</span>
              <span className="text-zinc-500 font-normal">@{tweet.quoted_tweet.author_handle}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-300 line-clamp-3">
              {tweet.quoted_tweet.text}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 max-w-xs text-zinc-500">
          <ActionBtn
            icon={<MessageCircle size={18} />}
            count={tweet.engagement.replies}
            onClick={() => onReply?.(tweet)}
            hoverColor="hover:text-sky-400"
          />
          <ActionBtn
            icon={<Repeat2 size={18} />}
            count={tweet.engagement.retweets}
            active={retweeted}
            activeColor="text-green-400"
            onClick={handleRetweet}
            hoverColor="hover:text-green-400"
          />
          <ActionBtn
            icon={<Heart size={18} className={liked ? "fill-pink-500" : ""} />}
            count={tweet.engagement.likes}
            active={liked}
            activeColor="text-pink-500"
            onClick={handleLike}
            hoverColor="hover:text-pink-500"
          />
          <ActionBtn
            icon={<Bookmark size={18} className={bookmarked ? "fill-sky-400" : ""} />}
            count={tweet.engagement.bookmarks}
            active={bookmarked}
            activeColor="text-sky-400"
            onClick={handleBookmark}
            hoverColor="hover:text-sky-400"
          />
        </div>
      </div>
    </article>
  );
}

function ActionBtn({
  icon,
  count,
  active,
  activeColor,
  hoverColor,
  onClick,
}: {
  icon: React.ReactNode;
  count: number;
  active?: boolean;
  activeColor?: string;
  hoverColor?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className={cn(
        "flex items-center gap-1 text-sm transition-colors",
        hoverColor,
        active && activeColor
      )}
    >
      {icon}
      <span>{formatCount(count)}</span>
    </button>
  );
}
