"use client";

import { useState } from "react";
import { Calendar, Clock, X } from "lucide-react";
import { useScheduled, useScheduleTweet, useCancelScheduled } from "@/lib/hooks/use-mcp";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import type { ScheduledTweet } from "@/types/twitter";

function formatScheduled(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function ScheduledPage() {
  const { data: tweets, isLoading } = useScheduled();
  const scheduleMutation = useScheduleTweet();
  const cancelMutation = useCancelScheduled();

  const [text, setText] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSchedule = async () => {
    if (!text.trim() || !scheduledAt) return;
    const iso = new Date(scheduledAt).toISOString();
    await scheduleMutation.mutateAsync({ text, scheduled_at: iso });
    setText("");
    setScheduledAt("");
    setShowForm(false);
  };

  return (
    <div>
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/10 px-4 h-14 flex items-center justify-between">
        <h1 className="text-xl font-bold">Scheduled</h1>
        <Button
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-sky-500 hover:bg-sky-400 font-bold text-white"
        >
          {showForm ? "Cancel" : "Schedule new"}
        </Button>
      </div>

      {/* Schedule form */}
      {showForm && (
        <div className="border-b border-white/10 p-4 space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you want to post?"
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 resize-none"
            rows={3}
          />
          <div className="flex items-center gap-3">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white flex-1"
            />
            <Button
              onClick={handleSchedule}
              disabled={!text.trim() || !scheduledAt || scheduleMutation.isPending}
              className="rounded-full bg-sky-500 hover:bg-sky-400 font-bold text-white"
            >
              {scheduleMutation.isPending ? "Scheduling…" : "Schedule"}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading && (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-white/10 space-y-2">
            <Skeleton className="h-4 w-20 bg-zinc-800" />
            <Skeleton className="h-4 w-full bg-zinc-800" />
          </div>
        ))
      )}

      {!isLoading && (!tweets || tweets.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Calendar size={40} className="mb-4 opacity-30" />
          <p className="font-semibold text-white">No scheduled posts</p>
          <p className="text-sm mt-1">Posts you schedule will appear here.</p>
        </div>
      )}

      {tweets?.map((tweet: ScheduledTweet) => (
        <div key={tweet.id} className="p-4 border-b border-white/10 group hover:bg-white/[0.02] transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                <Clock size={12} />
                <span>{formatScheduled(tweet.scheduled_at)}</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 capitalize">
                  {tweet.state}
                </span>
              </div>
              <p className="text-[15px] leading-relaxed">{tweet.text}</p>
            </div>
            <button
              onClick={() => cancelMutation.mutate(tweet.id)}
              disabled={cancelMutation.isPending}
              className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 p-1 rounded-full hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
