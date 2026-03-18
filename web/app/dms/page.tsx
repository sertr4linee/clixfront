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
      <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col">
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-100 px-4 h-14 flex items-center">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>

        {/* New DM */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex gap-2">
            <input
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              placeholder="@handle"
              className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none border border-gray-200"
            />
            <Button
              size="sm"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
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
              <div key={i} className="flex gap-3 p-4 border-b border-gray-100">
                <Skeleton className="w-10 h-10 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24 bg-gray-100" />
                  <Skeleton className="h-3 w-36 bg-gray-100" />
                </div>
              </div>
            ))
          )}

          {conversations?.map((conv: DMConversation) => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv)}
              className={cn(
                "w-full text-left flex gap-3 p-4 border-b border-white/10 hover:bg-gray-50 transition-colors",
                selected?.id === conv.id && "bg-blue-50"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {getParticipantName(conv).slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-gray-900 truncate">{getParticipantName(conv)}</p>
                  {conv.unread && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-gray-400 text-xs truncate">{conv.last_message}</p>
              </div>
            </button>
          ))}

          {!isLoading && !conversations?.length && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 px-4 text-center">
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
            <div className="border-b border-gray-100 px-4 h-14 flex items-center">
              <p className="font-bold">{selected ? getParticipantName(selected) : `@${newHandle}`}</p>
            </div>
            <div className="flex-1 overflow-y-auto" />
            <div className="border-t border-gray-100 p-3 flex gap-2">
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                placeholder="Start a new message"
                className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none border border-gray-200"
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
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-semibold text-gray-900">Select a message</p>
              <p className="text-sm mt-1">Choose from your existing conversations or start a new one.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
