"use client";

import { useState, useEffect } from "react";
import type {
  FlowNode,
  FlowNodeData,
  ActionConfig,
  AIConfig,
  ConditionConfig,
  DelayConfig,
  TriggerConfig,
} from "@/lib/flows/types";
import { getNodeCategory, CATEGORY_COLORS } from "@/lib/flows/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ConfigPanelProps = {
  node: FlowNode | null;
  onConfigChange: (nodeId: string, config: FlowNodeData["config"]) => void;
};

export function ConfigPanel({ node, onConfigChange }: ConfigPanelProps) {
  const [config, setConfig] = useState<FlowNodeData["config"]>({});

  useEffect(() => {
    if (node) setConfig(node.data.config);
  }, [node]);

  if (!node) {
    return (
      <div className="w-72 border-l border-gray-100 flex items-center justify-center bg-white h-full">
        <p className="text-xs text-gray-400">Select a node to configure</p>
      </div>
    );
  }

  const data = node.data;
  const category = getNodeCategory(data.type);
  const color = CATEGORY_COLORS[category];

  const update = (partial: Partial<FlowNodeData["config"]>) => {
    const next = { ...config, ...partial };
    setConfig(next);
    onConfigChange(node.id, next);
  };

  return (
    <div className="w-72 border-l border-gray-100 flex flex-col bg-white h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium text-gray-900">{data.label}</span>
        </div>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">
          {category} · {data.type}
        </span>
      </div>

      {/* Config fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Trigger configs */}
        {data.type === "trigger-schedule" && (
          <Field
            label="Cron expression"
            value={(config as TriggerConfig).cron || ""}
            onChange={(v) => update({ cron: v })}
            placeholder="0 9 * * 1-5"
          />
        )}
        {(data.type === "trigger-mention" ||
          data.type === "trigger-follower" ||
          data.type === "trigger-dm") && (
          <Field
            label="Poll interval (ms)"
            value={String((config as TriggerConfig).intervalMs || 60000)}
            onChange={(v) => update({ intervalMs: Number(v) })}
            type="number"
          />
        )}

        {/* Action configs */}
        {(data.type === "action-post" ||
          data.type === "action-reply" ||
          data.type === "action-dm") && (
          <>
            <Field
              label="Text"
              value={(config as ActionConfig).text || ""}
              onChange={(v) => update({ text: v })}
              placeholder="Use {{text}} for AI output"
              multiline
            />
            {data.type === "action-dm" && (
              <Field
                label="Handle"
                value={(config as ActionConfig).handle || ""}
                onChange={(v) => update({ handle: v })}
                placeholder="username (no @)"
              />
            )}
          </>
        )}
        {(data.type === "action-follow" || data.type === "action-unfollow") && (
          <Field
            label="Handle"
            value={(config as ActionConfig).handle || ""}
            onChange={(v) => update({ handle: v })}
            placeholder="username or {{tweet.author_handle}}"
          />
        )}

        {/* AI configs */}
        {(data.type === "ai-generate" || data.type === "ai-reply") && (
          <>
            <Field
              label="Prompt"
              value={(config as AIConfig).prompt || ""}
              onChange={(v) => update({ prompt: v })}
              placeholder="Use {{tweet.text}} for context"
              multiline
            />
            <Field
              label="Model"
              value={(config as AIConfig).model || "gpt-4o"}
              onChange={(v) => update({ model: v })}
            />
            <Field
              label="Temperature"
              value={String((config as AIConfig).temperature ?? 0.7)}
              onChange={(v) => update({ temperature: Number(v) })}
              type="number"
            />
            <Field
              label="Max tokens"
              value={String((config as AIConfig).maxTokens ?? 280)}
              onChange={(v) => update({ maxTokens: Number(v) })}
              type="number"
            />
          </>
        )}

        {/* Logic configs */}
        {data.type === "logic-condition" && (
          <>
            <Field
              label="Field"
              value={(config as ConditionConfig).field || ""}
              onChange={(v) => update({ field: v })}
              placeholder="tweet.text"
            />
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">
                Operator
              </label>
              <select
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900"
                value={(config as ConditionConfig).operator || "contains"}
                onChange={(e) => update({ operator: e.target.value as ConditionConfig["operator"] })}
              >
                <option value="equals">equals</option>
                <option value="contains">contains</option>
                <option value="matches">matches (regex)</option>
                <option value="gt">greater than</option>
                <option value="lt">less than</option>
              </select>
            </div>
            <Field
              label="Value"
              value={(config as ConditionConfig).value || ""}
              onChange={(v) => update({ value: v })}
            />
          </>
        )}
        {data.type === "logic-delay" && (
          <Field
            label="Delay (seconds)"
            value={String((config as DelayConfig).seconds || 30)}
            onChange={(v) => update({ seconds: Number(v) })}
            type="number"
          />
        )}

        {data.type === "trigger-manual" && (
          <p className="text-xs text-gray-400">
            No configuration needed. Click Run to trigger.
          </p>
        )}
      </div>

      <div className="p-3 border-t border-gray-100">
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs"
          onClick={() => onConfigChange(node.id, config)}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">
        {label}
      </label>
      {multiline ? (
        <textarea
          className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 resize-none h-20"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-gray-50 border-gray-200"
        />
      )}
    </div>
  );
}
