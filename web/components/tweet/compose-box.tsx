"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePostTweet } from "@/lib/hooks/use-mcp";
import { cn } from "@/lib/utils";

const MAX_CHARS = 280;

interface ComposeBoxProps {
  placeholder?: string;
  replyToId?: string;
  onSuccess?: () => void;
  className?: string;
}

export function ComposeBox({ placeholder, replyToId, onSuccess, className }: ComposeBoxProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mutation = usePostTweet();

  const remaining = MAX_CHARS - text.length;
  const overLimit = remaining < 0;
  const isEmpty = text.trim().length === 0;

  const handleSubmit = async () => {
    if (isEmpty || overLimit) return;
    await mutation.mutateAsync({ text, ...(replyToId ? { reply_to_id: replyToId } : {}) });
    setText("");
    onSuccess?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  // Auto-resize textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = `${el.scrollHeight}px`; }
  };

  return (
    <div className={cn("flex gap-3 p-4 border-b border-white/10", className)}>
      {/* Avatar placeholder */}
      <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
        ME
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "What's happening?"}
          className="resize-none min-h-[80px] bg-transparent border-0 text-xl placeholder:text-zinc-600 focus-visible:ring-0 p-0 text-white"
          rows={2}
        />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div />
          <div className="flex items-center gap-3">
            {/* Char counter */}
            {text.length > 0 && (
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 32 32" className="w-7 h-7 -rotate-90">
                  <circle cx="16" cy="16" r="13" fill="none" stroke="#333" strokeWidth="3" />
                  <circle
                    cx="16" cy="16" r="13" fill="none"
                    stroke={overLimit ? "#f43f5e" : remaining < 20 ? "#f59e0b" : "#1d9bf0"}
                    strokeWidth="3"
                    strokeDasharray={`${Math.min((text.length / MAX_CHARS) * 81.7, 81.7)} 81.7`}
                  />
                </svg>
                {remaining < 20 && (
                  <span className={cn("text-sm", overLimit ? "text-rose-500" : "text-zinc-400")}>
                    {remaining}
                  </span>
                )}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isEmpty || overLimit || mutation.isPending}
              className="rounded-full px-5 font-bold bg-sky-500 hover:bg-sky-400 text-white disabled:opacity-50"
            >
              {mutation.isPending ? "Posting…" : replyToId ? "Reply" : "Post"}
            </Button>
          </div>
        </div>

        {mutation.isError && (
          <p className="text-rose-400 text-sm">{(mutation.error as Error).message}</p>
        )}
      </div>
    </div>
  );
}
