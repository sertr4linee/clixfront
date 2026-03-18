"use client";

import { useState, useCallback, useEffect } from "react";
import { nanoid } from "nanoid";
import { FlowCanvas } from "@/components/automation/flow-canvas";
import { NodePanel } from "@/components/automation/node-panel";
import { ConfigPanel } from "@/components/automation/config-panel";
import { Button } from "@/components/ui/button";
import type {
  FlowFile,
  FlowNode,
  FlowEdge,
  FlowNodeData,
  FlowExecutionLog,
  NodeExecutionResult,
} from "@/lib/flows/types";
import { NODE_CATALOGUE } from "@/lib/flows/types";

export default function AutomationsPage() {
  const [flows, setFlows] = useState<FlowFile[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [activeFlow, setActiveFlow] = useState<FlowFile | null>(null);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [execLog, setExecLog] = useState<FlowExecutionLog | null>(null);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load flow list
  const loadFlows = useCallback(async () => {
    const res = await fetch("/api/flows");
    const data = await res.json();
    setFlows(data.flows || []);
  }, []);

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  // Load single flow
  const loadFlow = useCallback(async (id: string) => {
    const res = await fetch(`/api/flows/${id}`);
    const data = await res.json();
    setActiveFlow(data.flow);
    setActiveFlowId(id);
    setSelectedNode(null);
    setExecLog(null);
  }, []);

  // Create new flow
  const createFlow = useCallback(async () => {
    const res = await fetch("/api/flows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Untitled Flow" }),
    });
    const data = await res.json();
    await loadFlows();
    setActiveFlow(data.flow);
    setActiveFlowId(data.flow.id);
    setSelectedNode(null);
    setExecLog(null);
  }, [loadFlows]);

  // Delete flow
  const deleteFlow = useCallback(
    async (id: string) => {
      await fetch(`/api/flows/${id}`, { method: "DELETE" });
      if (activeFlowId === id) {
        setActiveFlow(null);
        setActiveFlowId(null);
      }
      await loadFlows();
    },
    [activeFlowId, loadFlows]
  );

  // Save flow
  const saveFlow = useCallback(
    async (updates?: Partial<FlowFile>) => {
      if (!activeFlow) return;
      setSaving(true);
      const body = {
        nodes: activeFlow.nodes,
        edges: activeFlow.edges,
        name: activeFlow.name,
        trigger: activeFlow.trigger,
        ...updates,
      };
      await fetch(`/api/flows/${activeFlow.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setSaving(false);
      await loadFlows();
    },
    [activeFlow, loadFlows]
  );

  // Run flow
  const runFlow = useCallback(async () => {
    if (!activeFlow) return;
    setRunning(true);
    setExecLog(null);
    try {
      const res = await fetch(`/api/flows/${activeFlow.id}/run`, {
        method: "POST",
      });
      const data = await res.json();
      setExecLog(data.log);
    } catch (err) {
      setExecLog({
        flowId: activeFlow.id,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        results: [
          {
            nodeId: "root",
            status: "error",
            error: err instanceof Error ? err.message : String(err),
            durationMs: 0,
          },
        ],
      });
    }
    setRunning(false);
  }, [activeFlow]);

  // Handle node drop from palette
  const handleDrop = useCallback(
    (type: string, position: { x: number; y: number }) => {
      if (!activeFlow) return;
      const catalogueEntry = NODE_CATALOGUE.find((n) => n.type === type);
      if (!catalogueEntry) return;

      const newNode: FlowNode = {
        id: nanoid(8),
        type: "automation",
        position,
        data: {
          type: catalogueEntry.type,
          label: catalogueEntry.label,
          config: { ...catalogueEntry.defaultConfig },
        } as FlowNodeData,
      };

      const updated = {
        ...activeFlow,
        nodes: [...activeFlow.nodes, newNode],
      };
      setActiveFlow(updated);
      // Auto-save on drop
      saveFlow({ nodes: updated.nodes });
    },
    [activeFlow, saveFlow]
  );

  // Handle node config change
  const handleConfigChange = useCallback(
    (nodeId: string, config: FlowNodeData["config"]) => {
      if (!activeFlow) return;
      const updatedNodes = activeFlow.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, config } } : n
      );
      const updated = { ...activeFlow, nodes: updatedNodes };
      setActiveFlow(updated);
      saveFlow({ nodes: updatedNodes });
    },
    [activeFlow, saveFlow]
  );

  const handleNodesChange = useCallback(
    (nodes: FlowNode[]) => {
      if (!activeFlow) return;
      setActiveFlow((f) => (f ? { ...f, nodes } : f));
    },
    [activeFlow]
  );

  const handleEdgesChange = useCallback(
    (edges: FlowEdge[]) => {
      if (!activeFlow) return;
      const updated = { ...activeFlow, edges };
      setActiveFlow(updated);
      saveFlow({ edges });
    },
    [activeFlow, saveFlow]
  );

  return (
    <div className="flex h-[calc(100vh-0px)] bg-zinc-950">
      {/* Left: flow list + node palette */}
      <NodePanel
        flows={flows}
        activeFlowId={activeFlowId}
        onSelectFlow={loadFlow}
        onNewFlow={createFlow}
        onDeleteFlow={deleteFlow}
      />

      {/* Center: canvas + toolbar + exec log */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-white">
              {activeFlow?.name || "Automations"}
            </h1>
            {activeFlow && (
              <input
                className="bg-transparent border-b border-zinc-700 text-sm text-zinc-300 outline-none px-1 w-40"
                value={activeFlow.name}
                onChange={(e) => {
                  setActiveFlow((f) =>
                    f ? { ...f, name: e.target.value } : f
                  );
                }}
                onBlur={() => saveFlow({ name: activeFlow.name })}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-[10px] text-zinc-500">Saving…</span>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={!activeFlow || running}
              onClick={runFlow}
              className="text-xs"
            >
              {running ? "Running…" : "▶ Run"}
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          {activeFlow ? (
            <FlowCanvas
              key={activeFlowId}
              flow={activeFlow}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onNodeSelect={setSelectedNode}
              onDrop={handleDrop}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600">
              <div className="text-center">
                <p className="text-lg mb-2">⚡</p>
                <p className="text-sm">
                  Create a new flow or select one to start
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Execution log drawer */}
        {execLog && (
          <div className="border-t border-zinc-800 bg-zinc-950 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50">
              <span className="text-xs font-medium text-zinc-300">
                Execution Log
              </span>
              <button
                className="text-xs text-zinc-500 hover:text-zinc-300"
                onClick={() => setExecLog(null)}
              >
                ✕
              </button>
            </div>
            <div className="p-2 space-y-1">
              {execLog.results.map((r: NodeExecutionResult, i: number) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs ${
                    r.status === "success"
                      ? "bg-green-500/10 text-green-400"
                      : r.status === "error"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  <span>
                    {r.status === "success"
                      ? "✓"
                      : r.status === "error"
                        ? "✗"
                        : "—"}
                  </span>
                  <span className="font-mono">{r.nodeId}</span>
                  <span className="text-zinc-600">{r.durationMs}ms</span>
                  {r.error && (
                    <span className="text-red-300 truncate ml-2">
                      {r.error}
                    </span>
                  )}
                  {r.output && (
                    <span className="text-zinc-500 truncate ml-2">
                      {JSON.stringify(r.output).slice(0, 80)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: node config */}
      <ConfigPanel node={selectedNode} onConfigChange={handleConfigChange} />
    </div>
  );
}
