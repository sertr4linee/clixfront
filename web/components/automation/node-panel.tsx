"use client";

import { useState } from "react";
import {
  NODE_CATALOGUE,
  CATEGORY_COLORS,
  type NodeCategory,
} from "@/lib/flows/types";
import type { FlowFile } from "@/lib/flows/types";
import { Button } from "@/components/ui/button";

type NodePanelProps = {
  flows: FlowFile[];
  activeFlowId: string | null;
  onSelectFlow: (id: string) => void;
  onNewFlow: () => void;
  onDeleteFlow: (id: string) => void;
};

const CATEGORIES: { key: NodeCategory; label: string }[] = [
  { key: "trigger", label: "Triggers" },
  { key: "action", label: "Actions" },
  { key: "ai", label: "AI" },
  { key: "logic", label: "Logic" },
];

export function NodePanel({
  flows,
  activeFlowId,
  onSelectFlow,
  onNewFlow,
  onDeleteFlow,
}: NodePanelProps) {
  const [tab, setTab] = useState<"flows" | "nodes">("flows");

  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("application/reactflow", type);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-60 border-r border-zinc-800 flex flex-col bg-zinc-950 h-full">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-800">
        <button
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
            tab === "flows"
              ? "text-white border-b-2 border-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          onClick={() => setTab("flows")}
        >
          Flows
        </button>
        <button
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
            tab === "nodes"
              ? "text-white border-b-2 border-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          onClick={() => setTab("nodes")}
        >
          Nodes
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {tab === "flows" ? (
          <>
            <Button
              onClick={onNewFlow}
              className="w-full mb-2"
              size="sm"
              variant="outline"
            >
              + New Flow
            </Button>
            {flows.map((f) => (
              <div
                key={f.id}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                  f.id === activeFlowId
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
                onClick={() => onSelectFlow(f.id)}
              >
                <span className="truncate">{f.name}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 text-xs ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFlow(f.id);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            {flows.length === 0 && (
              <p className="text-xs text-zinc-600 text-center py-6">
                No flows yet
              </p>
            )}
          </>
        ) : (
          /* Node palette — drag onto canvas */
          CATEGORIES.map((cat) => (
            <div key={cat.key} className="mb-3">
              <div
                className="text-[10px] font-semibold uppercase tracking-wider mb-1 px-1"
                style={{ color: CATEGORY_COLORS[cat.key] }}
              >
                {cat.label}
              </div>
              {NODE_CATALOGUE.filter((n) => n.category === cat.key).map(
                (entry) => (
                  <div
                    key={entry.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, entry.type)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing text-sm text-zinc-300 hover:bg-zinc-800/60 transition-colors"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[cat.key] }}
                    />
                    <span className="truncate">{entry.label}</span>
                  </div>
                )
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
