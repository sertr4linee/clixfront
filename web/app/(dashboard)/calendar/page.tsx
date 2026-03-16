"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, fromUnixTime } from "date-fns";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { scheduledApi } from "@/lib/api";
import type { ScheduledTweet } from "@/lib/types";
import { TweetComposer } from "@/components/tweet/TweetComposer";

export default function CalendarPage() {
  const [composerOpen, setComposerOpen] = useState(false);
  const qc = useQueryClient();

  const { data: scheduled = [], isLoading } = useQuery({
    queryKey: ["scheduled"],
    queryFn: scheduledApi.list,
    refetchInterval: 30_000,
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => scheduledApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled"] }),
  });

  const byDay = scheduled.reduce<Record<string, ScheduledTweet[]>>((acc, tw) => {
    const day = format(fromUnixTime(tw.execute_at), "yyyy-MM-dd");
    (acc[day] ||= []).push(tw);
    return acc;
  }, {});

  const sortedDays = Object.keys(byDay).sort();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-4 flex items-center justify-between backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.8)", borderBottom: "1px solid #2f3336" }}
      >
        <div className="flex items-center gap-2">
          <Calendar size={20} style={{ color: "#1d9bf0" }} />
          <h1 className="font-bold text-lg" style={{ color: "#e7e9ea" }}>
            Scheduled Tweets
          </h1>
          {scheduled.length > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "#1d9bf01a", color: "#1d9bf0" }}
            >
              {scheduled.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setComposerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: "#1d9bf0", color: "#fff" }}
        >
          <Plus size={16} />
          Schedule
        </button>
      </div>

      {composerOpen && <TweetComposer onClose={() => setComposerOpen(false)} />}

      {/* Content */}
      <div className="p-4">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "#16181c" }} />
            ))}
          </div>
        )}

        {!isLoading && scheduled.length === 0 && (
          <div className="py-16 text-center">
            <Calendar size={48} className="mx-auto mb-4" style={{ color: "#2f3336" }} />
            <p className="font-bold mb-1" style={{ color: "#e7e9ea" }}>
              No scheduled tweets
            </p>
            <p className="text-sm" style={{ color: "#71767b" }}>
              Schedule your first tweet to keep your audience engaged.
            </p>
          </div>
        )}

        {sortedDays.map((day) => (
          <div key={day} className="mb-6">
            <h2 className="text-sm font-bold mb-2 px-1" style={{ color: "#71767b" }}>
              {format(new Date(day + "T00:00:00"), "EEEE, MMMM d")}
            </h2>
            <div className="space-y-2">
              {byDay[day].map((tw) => (
                <div
                  key={tw.id}
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ background: "#16181c", border: "1px solid #2f3336" }}
                >
                  <div className="flex-shrink-0 text-center w-12">
                    <p className="text-xs font-mono font-bold" style={{ color: "#1d9bf0" }}>
                      {format(fromUnixTime(tw.execute_at), "HH:mm")}
                    </p>
                  </div>
                  <p className="flex-1 text-sm leading-relaxed" style={{ color: "#e7e9ea" }}>
                    {tw.text}
                  </p>
                  <button
                    onClick={() => cancelMut.mutate(tw.id)}
                    disabled={cancelMut.isPending}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-red-500/10 transition-colors disabled:opacity-40"
                    style={{ color: "#71767b" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#f4212e")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#71767b")}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
