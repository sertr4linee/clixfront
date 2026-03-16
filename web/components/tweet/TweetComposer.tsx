"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image, X } from "lucide-react";
import { useRef, useState } from "react";
import { tweetApi, scheduledApi, mediaApi } from "@/lib/api";

interface Props {
  onClose: () => void;
  replyTo?: string;
}

export function TweetComposer({ onClose, replyTo }: Props) {
  const [text, setText] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [mediaIds, setMediaIds] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const postMutation = useMutation({
    mutationFn: () =>
      tweetApi.post({ text, reply_to: replyTo, media_ids: mediaIds.length ? mediaIds : undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      onClose();
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: () => {
      const ts = Math.floor(new Date(scheduleDate).getTime() / 1000);
      return scheduledApi.create({ text, execute_at: ts, media_ids: mediaIds.length ? mediaIds : undefined });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduled"] });
      onClose();
    },
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4 - mediaFiles.length);
    for (const file of files) {
      try {
        const { media_id } = await mediaApi.upload(file);
        setMediaIds((prev) => [...prev, media_id]);
        setMediaFiles((prev) => [...prev, file]);
      } catch {}
    }
  };

  const charsLeft = 280 - text.length;
  const canPost = text.trim().length > 0 && charsLeft >= 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-5 shadow-2xl"
        style={{ background: "#16181c", border: "1px solid #2f3336" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} style={{ color: "#e7e9ea" }} />
          </button>
          <button
            onClick={() => setIsScheduling((s) => !s)}
            className="text-sm px-3 py-1 rounded-full transition-colors"
            style={{
              color: "#1d9bf0",
              background: isScheduling ? "#1d9bf01a" : "transparent",
              border: "1px solid #1d9bf0",
            }}
          >
            {isScheduling ? "Scheduled" : "Schedule"}
          </button>
        </div>

        {/* Text area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={replyTo ? "Write your reply..." : "What's happening?"}
          rows={4}
          className="w-full resize-none bg-transparent text-lg outline-none placeholder:text-[#71767b]"
          style={{ color: "#e7e9ea" }}
          autoFocus
        />

        {/* Media previews */}
        {mediaFiles.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {mediaFiles.map((f, i) => (
              <div key={i} className="relative">
                <img
                  src={URL.createObjectURL(f)}
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setMediaFiles((prev) => prev.filter((_, j) => j !== i));
                    setMediaIds((prev) => prev.filter((_, j) => j !== i));
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{ background: "#000", color: "#e7e9ea", border: "1px solid #2f3336" }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Schedule picker */}
        {isScheduling && (
          <div className="mt-3">
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "#000",
                color: "#e7e9ea",
                border: "1px solid #2f3336",
              }}
            />
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between mt-4 pt-4"
          style={{ borderTop: "1px solid #2f3336" }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={mediaFiles.length >= 4}
              className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-40"
              style={{ color: "#1d9bf0" }}
            >
              <Image size={18} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/mp4"
              multiple
              className="hidden"
              onChange={handleFile}
            />
          </div>

          <div className="flex items-center gap-3">
            <span
              className="text-sm"
              style={{ color: charsLeft < 20 ? (charsLeft < 0 ? "#f4212e" : "#ffd400") : "#71767b" }}
            >
              {charsLeft}
            </span>
            <button
              onClick={() =>
                isScheduling && scheduleDate
                  ? scheduleMutation.mutate()
                  : postMutation.mutate()
              }
              disabled={
                !canPost ||
                postMutation.isPending ||
                scheduleMutation.isPending ||
                (isScheduling && !scheduleDate)
              }
              className="px-5 py-2 rounded-full font-bold text-sm transition-opacity disabled:opacity-40 hover:opacity-90"
              style={{ background: "#1d9bf0", color: "#fff" }}
            >
              {isScheduling ? "Schedule" : "Post"}
            </button>
          </div>
        </div>

        {(postMutation.isError || scheduleMutation.isError) && (
          <p className="mt-2 text-sm" style={{ color: "#f4212e" }}>
            {(postMutation.error || scheduleMutation.error)?.message}
          </p>
        )}
      </div>
    </div>
  );
}
