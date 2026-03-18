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
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <h1 className="text-xl font-bold">Scheduled</h1>
        <Button
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-blue-600 hover:bg-blue-700 font-bold text-white"
        >
          {showForm ? "Cancel" : "Schedule new"}
        </Button>
      </div>

      {/* Schedule form */}
      {showForm && (
        <div className="border-b border-gray-100 p-4 space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you want to post?"
            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 resize-none"
            rows={3}
          />
          <div className="flex items-center gap-3">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 flex-1"
            />
            <Button
              onClick={handleSchedule}
              disabled={!text.trim() || !scheduledAt || scheduleMutation.isPending}
              className="rounded-full bg-blue-600 hover:bg-blue-700 font-bold text-white"
            >
              {scheduleMutation.isPending ? "Scheduling…" : "Schedule"}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading && (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-gray-100 space-y-2">
            <Skeleton className="h-4 w-20 bg-gray-100" />
            <Skeleton className="h-4 w-full bg-gray-100" />
          </div>
        ))
      )}

      {!isLoading && (!tweets || tweets.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Calendar size={40} className="mb-4 opacity-30" />
          <p className="font-semibold text-gray-900">No scheduled posts</p>
          <p className="text-sm mt-1">Posts you schedule will appear here.</p>
        </div>
      )}

      {tweets?.map((tweet: ScheduledTweet) => (
        <div key={tweet.id} className="p-4 border-b border-gray-100 group hover:bg-gray-50/60 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <Clock size={12} />
                <span>{formatScheduled(tweet.scheduled_at)}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize">
                  {tweet.state}
                </span>
              </div>
              <p className="text-[15px] leading-relaxed">{tweet.text}</p>
            </div>
            <button
              onClick={() => cancelMutation.mutate(tweet.id)}
              disabled={cancelMutation.isPending}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 p-1 rounded-full hover:bg-gray-100 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
