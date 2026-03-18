"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useDmInbox, useSendDm } from "@/lib/hooks/use-mcp";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DMConversation } from "@/types/twitter";

export default function DmsPage() {
  const { data: conversations, isLoading } = useDmInbox();
  const sendMutation = useSendDm();

  const [selected, setSelected] = useState<DMConversation | null>(null);
  const [newHandle, setNewHandle] = useState("");
  const [messageText, setMessageText] = useState("");

  const handleSend = async () => {
    if (!messageText.trim()) return;
    const handle = selected
      ? (selected.participants.find(p => p.screen_name || p.handle)?.screen_name ?? selected.participants[0]?.handle ?? "")
      : newHandle;
    if (!handle) return;
    await sendMutation.mutateAsync({ handle, text: messageText });
    setMessageText("");
  };

  const getParticipantName = (conv: DMConversation) => {
    const p = conv.participants[0];
    return p?.name ?? p?.handle ?? p?.screen_name ?? conv.id;
  };

  return (
    <div className="flex h-screen">
      {/* Inbox list */}
      <div className="w-80 flex-shrink-0 border-r border-white/10 flex flex-col">
        <div className="sticky top-0 bg-black/80 backdrop-blur border-b border-white/10 px-4 h-14 flex items-center">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>

        {/* New DM */}
        <div className="p-3 border-b border-white/10">
          <div className="flex gap-2">
            <input
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              placeholder="@handle"
              className="flex-1 bg-zinc-900 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none border border-zinc-800"
            />
            <Button
              size="sm"
              className="rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold"
              onClick={() => {
                if (newHandle) setSelected(null);
              }}
            >
              New
            </Button>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-4 border-b border-white/10">
                <Skeleton className="w-10 h-10 rounded-full bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24 bg-zinc-800" />
                  <Skeleton className="h-3 w-36 bg-zinc-800" />
                </div>
              </div>
            ))
          )}

          {conversations?.map((conv: DMConversation) => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv)}
              className={cn(
                "w-full text-left flex gap-3 p-4 border-b border-white/10 hover:bg-white/5 transition-colors",
                selected?.id === conv.id && "bg-white/5"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {getParticipantName(conv).slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm truncate">{getParticipantName(conv)}</p>
                  {conv.unread && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-zinc-500 text-xs truncate">{conv.last_message}</p>
              </div>
            </button>
          ))}

          {!isLoading && !conversations?.length && (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 px-4 text-center">
              <MessageCircle size={32} className="mb-3 opacity-30" />
              <p className="text-sm">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Message pane */}
      <div className="flex-1 flex flex-col">
        {selected || newHandle ? (
          <>
            <div className="border-b border-white/10 px-4 h-14 flex items-center">
              <p className="font-bold">{selected ? getParticipantName(selected) : `@${newHandle}`}</p>
            </div>
            <div className="flex-1 overflow-y-auto" />
            <div className="border-t border-white/10 p-3 flex gap-2">
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                placeholder="Start a new message"
                className="flex-1 bg-zinc-900 rounded-full px-4 py-2 text-sm text-white placeholder:text-zinc-500 outline-none border border-zinc-800"
              />
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!messageText.trim() || sendMutation.isPending}
                className="rounded-full bg-sky-500 hover:bg-sky-400 text-white"
              >
                <Send size={16} />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-semibold text-white">Select a message</p>
              <p className="text-sm mt-1">Choose from your existing conversations or start a new one.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
