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
        rounded-xl border-2 bg-white px-4 py-3 min-w-[160px]
        shadow-sm transition-all duration-150
        ${selected ? "ring-2 ring-blue-500/30 scale-105 shadow-md" : "hover:ring-1 hover:ring-gray-200 hover:shadow-md"}
      `}
      style={{ borderColor: color }}
    >
      {/* Input handle (not for triggers) */}
      {category !== "trigger" && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !border-2 !border-gray-300 !bg-gray-100"
        />
      )}

      <div className="flex items-center gap-2">
        <span
          className="flex items-center justify-center w-7 h-7 rounded-lg text-sm"
          style={{ backgroundColor: color + "18", color }}
        >
          {CATEGORY_ICONS[category]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-700 truncate">
            {nodeData.label}
          </div>
          <div className="text-[10px] text-gray-400 truncate capitalize">
            {category}
          </div>
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-gray-300 !bg-gray-100"
      />

      {/* Condition node has a second output for "false" branch */}
      {nodeData.type === "logic-condition" && (
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          className="!w-3 !h-3 !border-2 !border-red-300 !bg-red-100"
        />
      )}
    </div>
  );
}
