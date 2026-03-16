"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useState } from "react";
import { dmApi } from "@/lib/api";
import type { DMConversation } from "@/lib/types";

export default function DMPage() {
  const [selected, setSelected] = useState<DMConversation | null>(null);
  const [text, setText] = useState("");

  const { data: convos = [], isLoading } = useQuery({
    queryKey: ["dm-inbox"],
    queryFn: dmApi.inbox,
  });

  const sendMut = useMutation({
    mutationFn: (handle: string) => dmApi.send(handle, text),
    onSuccess: () => setText(""),
  });

  const getHandle = (c: DMConversation) =>
    c.participants.find((p) => p.handle)?.handle || c.id;

  return (
    <div className="flex h-screen max-h-screen">
      {/* Sidebar */}
      <div
        className="w-80 flex-shrink-0 flex flex-col border-r overflow-y-auto"
        style={{ borderColor: "#2f3336" }}
      >
        <div
          className="px-4 py-4 font-bold sticky top-0"
          style={{ background: "rgba(0,0,0,0.9)", borderBottom: "1px solid #2f3336", color: "#e7e9ea" }}
        >
          Messages
        </div>

        {isLoading && (
          <div className="p-4 text-center" style={{ color: "#71767b" }}>Loading...</div>
        )}

        {convos.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className="flex items-start gap-3 px-4 py-3 text-left w-full transition-colors"
            style={{
              background: selected?.id === c.id ? "#1d9bf01a" : "transparent",
              borderBottom: "1px solid #2f3336",
            }}
            onMouseEnter={(e) => {
              if (selected?.id !== c.id) e.currentTarget.style.background = "#ffffff08";
            }}
            onMouseLeave={(e) => {
              if (selected?.id !== c.id) e.currentTarget.style.background = "transparent";
            }}
          >
            <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ background: "#2f3336" }} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: "#e7e9ea" }}>
                {c.participants.map((p) => p.name || p.handle || "Unknown").join(", ")}
              </p>
              <p className="text-xs truncate" style={{ color: "#71767b" }}>
                {c.last_message}
              </p>
            </div>
            {c.unread && (
              <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: "#1d9bf0" }} />
            )}
          </button>
        ))}

        {!isLoading && convos.length === 0 && (
          <div className="p-8 text-center" style={{ color: "#71767b" }}>No messages</div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div
              className="px-4 py-4 font-bold border-b"
              style={{ borderColor: "#2f3336", color: "#e7e9ea" }}
            >
              @{getHandle(selected)}
            </div>
            <div className="flex-1" />
            <div className="p-4 flex gap-2" style={{ borderTop: "1px solid #2f3336" }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && text.trim()) {
                    e.preventDefault();
                    sendMut.mutate(getHandle(selected));
                  }
                }}
                placeholder="Write a message..."
                className="flex-1 px-4 py-2 rounded-full outline-none text-sm"
                style={{ background: "#202327", color: "#e7e9ea" }}
              />
              <button
                onClick={() => text.trim() && sendMut.mutate(getHandle(selected))}
                disabled={!text.trim() || sendMut.isPending}
                className="p-2 rounded-full transition-opacity disabled:opacity-40"
                style={{ background: "#1d9bf0", color: "#fff" }}
              >
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ color: "#71767b" }}>
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
