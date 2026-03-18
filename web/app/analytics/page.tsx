"use client";

import { useState, useMemo } from "react";
import { useAuthStatus, useUserTweets } from "@/lib/hooks/use-mcp";
import { computeAnalytics, DAYS, MONTHS } from "@/lib/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Wed", "Fri"];
const HOUR_LABELS = ["12am","3am","6am","9am","12pm","3pm","6pm","9pm"];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-5 flex flex-col gap-1">
      <p className="text-zinc-500 text-sm">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      {sub && <p className="text-zinc-500 text-xs">{sub}</p>}
    </div>
  );
}

/** GitHub-style activity heatmap */
function Heatmap({ heatmap }: { heatmap: Record<string, number> }) {
  // Build 52 weeks × 7 days grid
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  // Move start to nearest Sunday
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);

  const weeks: Date[][] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const max = Math.max(1, ...Object.values(heatmap));

  const cellColor = (count: number) => {
    if (!count) return "bg-zinc-800";
    const pct = count / max;
    if (pct < 0.25) return "bg-sky-900";
    if (pct < 0.5)  return "bg-sky-700";
    if (pct < 0.75) return "bg-sky-500";
    return "bg-sky-400";
  };

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  weeks.forEach((week, i) => {
    const d = week[0];
    if (d.getDate() <= 7) {
      monthLabels.push({ label: MONTHS[d.getMonth()], col: i });
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] justify-around mr-1">
          {["","Mon","","Wed","","Fri",""].map((d, i) => (
            <div key={i} className="h-[10px] text-[9px] text-zinc-600 leading-none w-6 text-right">
              {d}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          {/* Month labels */}
          <div className="flex gap-[3px] h-4">
            {weeks.map((_, i) => {
              const ml = monthLabels.find((m) => m.col === i);
              return (
                <div key={i} className="w-[10px] text-[9px] text-zinc-600">
                  {ml?.label ?? ""}
                </div>
              );
            })}
          </div>

          {/* Grid: 7 rows (days of week) × N cols (weeks) */}
          <div className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }, (_, dayIdx) => (
              <div key={dayIdx} className="flex gap-[3px]">
                {weeks.map((week, wi) => {
                  const d = week[dayIdx];
                  const key = d?.toISOString().slice(0, 10) ?? "";
                  const count = heatmap[key] ?? 0;
                  const isFuture = d > today;
                  return (
                    <div
                      key={wi}
                      title={d ? `${key}: ${count} post${count !== 1 ? "s" : ""}` : ""}
                      className={cn(
                        "w-[10px] h-[10px] rounded-[2px] transition-colors",
                        isFuture ? "bg-zinc-900" : cellColor(count)
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1 mt-1 justify-end">
            <span className="text-[9px] text-zinc-600">Less</span>
            {["bg-zinc-800","bg-sky-900","bg-sky-700","bg-sky-500","bg-sky-400"].map((c, i) => (
              <div key={i} className={cn("w-[10px] h-[10px] rounded-[2px]", c)} />
            ))}
            <span className="text-[9px] text-zinc-600">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 24-hour bar chart */
function HourChart({ distribution, bestHour }: { distribution: number[]; bestHour: number | null }) {
  const max = Math.max(1, ...distribution);
  return (
    <div className="flex items-end gap-[3px] h-20">
      {distribution.map((v, h) => (
        <div
          key={h}
          title={`${h}:00 — ${v} posts`}
          className="flex-1 flex flex-col items-center justify-end"
        >
          <div
            className={cn(
              "w-full rounded-t transition-all",
              h === bestHour ? "bg-sky-400" : "bg-zinc-700"
            )}
            style={{ height: `${(v / max) * 100}%`, minHeight: v ? 2 : 0 }}
          />
        </div>
      ))}
    </div>
  );
}

/** Weekday bar chart */
function WeekdayChart({ distribution }: { distribution: number[] }) {
  const max = Math.max(1, ...distribution);
  return (
    <div className="flex items-end gap-2 h-20">
      {DAYS.map((day, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-sky-500 transition-all"
            style={{ height: `${(distribution[i] / max) * 100}%`, minHeight: distribution[i] ? 2 : 0 }}
          />
          <span className="text-[10px] text-zinc-500">{day}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: authData } = useAuthStatus();
  const [handle, setHandle] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const activeHandle = submitted ? handle : "";

  const { data: tweetsData, isLoading } = useUserTweets(activeHandle);
  const analytics = useMemo(
    () => computeAnalytics(tweetsData?.tweets ?? []),
    [tweetsData]
  );

  const hasData = submitted && !isLoading && (tweetsData?.tweets?.length ?? 0) > 0;
  const noData  = submitted && !isLoading && (tweetsData?.tweets?.length ?? 0) === 0;

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/10 px-4 h-14 flex items-center">
        <h1 className="text-xl font-bold">Analytics</h1>
      </div>

      {/* Handle input */}
      <div className="p-6 border-b border-white/10">
        <p className="text-zinc-500 text-sm mb-3">Enter your X handle to see analytics</p>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-zinc-900 rounded-full px-4 py-2 flex-1 border border-zinc-800 focus-within:border-sky-500 transition-colors">
            <span className="text-zinc-500">@</span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value.replace("@", ""))}
              onKeyDown={(e) => { if (e.key === "Enter" && handle) setSubmitted(true); }}
              placeholder={authData?.account ?? "handle"}
              className="flex-1 bg-transparent outline-none text-white placeholder:text-zinc-600"
            />
          </div>
          <button
            onClick={() => handle && setSubmitted(true)}
            disabled={!handle || isLoading}
            className="px-5 py-2 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm transition-colors disabled:opacity-40"
          >
            {isLoading ? "Loading…" : "Analyze"}
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="p-6 grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-zinc-900" />
          ))}
        </div>
      )}

      {/* No data */}
      {noData && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-sm">
          <p>No tweets found for @{handle}</p>
        </div>
      )}

      {/* Stats */}
      {hasData && (
        <div className="p-4 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Current Streak"
              value={analytics.currentStreak}
              sub={`Longest: ${analytics.longestStreak} days`}
            />
            <StatCard
              label="Total Posts"
              value={analytics.totalPosts}
              sub={`${analytics.activeDays} active days`}
            />
            <StatCard
              label="Avg Per Week"
              value={analytics.avgPerWeek}
              sub="posts"
            />
            <StatCard
              label="This Month"
              value={analytics.thisMonth}
              sub={`Last week: ${analytics.lastWeek} · This week: ${analytics.thisWeek}`}
            />
          </div>

          {/* Activity heatmap */}
          <div className="bg-zinc-900 rounded-2xl p-5">
            <h2 className="font-bold mb-4">Activity</h2>
            <Heatmap heatmap={analytics.heatmap} />
          </div>

          {/* Engagement */}
          <div className="bg-zinc-900 rounded-2xl p-5">
            <h2 className="font-bold mb-4">Avg Engagement</h2>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Likes",     value: analytics.avgLikes },
                { label: "Retweets",  value: analytics.avgRetweets },
                { label: "Replies",   value: analytics.avgReplies },
                { label: "Views",     value: analytics.avgViews.toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Best time to post */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 rounded-2xl p-5">
              <h2 className="font-bold mb-3 text-sm">Best Hour</h2>
              {analytics.totalPosts >= 3 ? (
                <>
                  <HourChart distribution={analytics.hourDistribution} bestHour={analytics.bestHour} />
                  <div className="flex justify-between mt-1">
                    {HOUR_LABELS.map((l) => (
                      <span key={l} className="text-[9px] text-zinc-600">{l}</span>
                    ))}
                  </div>
                  {analytics.bestHour !== null && (
                    <p className="text-sky-400 text-sm font-semibold mt-2">
                      {analytics.bestHour}:00 – {analytics.bestHour + 1}:00
                    </p>
                  )}
                </>
              ) : (
                <p className="text-zinc-500 text-xs">Post at least 3 times to see patterns</p>
              )}
            </div>

            <div className="bg-zinc-900 rounded-2xl p-5">
              <h2 className="font-bold mb-3 text-sm">Best Day</h2>
              {analytics.totalPosts >= 3 ? (
                <>
                  <WeekdayChart distribution={analytics.weekdayDistribution} />
                  {analytics.bestDay !== null && (
                    <p className="text-sky-400 text-sm font-semibold mt-2">
                      {DAYS[analytics.bestDay]}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-zinc-500 text-xs">Post at least 3 times to see patterns</p>
              )}
            </div>
          </div>

          {/* Top tweets */}
          {analytics.topTweets.length > 0 && (
            <div className="bg-zinc-900 rounded-2xl p-5">
              <h2 className="font-bold mb-4">Top Posts</h2>
              <div className="space-y-4">
                {analytics.topTweets.map((tweet) => (
                  <div key={tweet.id} className="border-b border-white/5 last:border-0 pb-4 last:pb-0">
                    <p className="text-sm leading-relaxed line-clamp-2">{tweet.text}</p>
                    <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                      <span>❤️ {tweet.engagement.likes.toLocaleString()}</span>
                      <span>🔁 {tweet.engagement.retweets.toLocaleString()}</span>
                      <span>💬 {tweet.engagement.replies.toLocaleString()}</span>
                      {tweet.engagement.views > 0 && (
                        <span>👁 {tweet.engagement.views.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
