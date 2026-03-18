"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  type FlowNodeData,
  getNodeCategory,
  CATEGORY_COLORS,
} from "@/lib/flows/types";

const CATEGORY_ICONS: Record<string, string> = {
  trigger: "⚡",
  action: "▶",
  ai: "✨",
  logic: "◆",
};

export function AutomationNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as FlowNodeData;
  const category = getNodeCategory(nodeData.type);
  const color = CATEGORY_COLORS[category];

  return (
    <div
      className={`
        rounded-xl border-2 bg-zinc-900/95 backdrop-blur-sm px-4 py-3 min-w-[160px]
        shadow-lg transition-all duration-150
        ${selected ? "ring-2 ring-white/30 scale-105" : "hover:ring-1 hover:ring-white/10"}
      `}
      style={{ borderColor: color }}
    >
      {/* Input handle (not for triggers) */}
      {category !== "trigger" && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !border-2 !border-zinc-700 !bg-zinc-500"
        />
      )}

      <div className="flex items-center gap-2">
        <span
          className="flex items-center justify-center w-7 h-7 rounded-lg text-sm"
          style={{ backgroundColor: color + "22", color }}
        >
          {CATEGORY_ICONS[category]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-zinc-300 truncate">
            {nodeData.label}
          </div>
          <div className="text-[10px] text-zinc-500 truncate capitalize">
            {category}
          </div>
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-zinc-700 !bg-zinc-500"
      />

      {/* Condition node has a second output for "false" branch */}
      {nodeData.type === "logic-condition" && (
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          className="!w-3 !h-3 !border-2 !border-red-700 !bg-red-500"
        />
      )}
    </div>
  );
}
