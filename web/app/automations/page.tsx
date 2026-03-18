"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  const [openaiKey, setOpenaiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Stable refs to avoid stale closures in callbacks
  const activeFlowRef = useRef<FlowFile | null>(null);
  activeFlowRef.current = activeFlow;

  // Load OpenAI key from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("clix_openai_key");
    if (stored) setOpenaiKey(stored);
  }, []);

  const saveOpenaiKey = (key: string) => {
    setOpenaiKey(key);
    localStorage.setItem("clix_openai_key", key);
  };

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
      if (activeFlowRef.current?.id === id) {
        setActiveFlow(null);
        setActiveFlowId(null);
      }
      await loadFlows();
    },
    [loadFlows]
  );

  // Persist changes to API (uses ref to avoid stale closure)
  const persistFlow = useCallback(async (updates: Partial<FlowFile>) => {
    const flow = activeFlowRef.current;
    if (!flow) return;
    setSaving(true);
    await fetch(`/api/flows/${flow.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nodes: flow.nodes,
        edges: flow.edges,
        name: flow.name,
        trigger: flow.trigger,
        ...updates,
      }),
    });
    setSaving(false);
  }, []);

  // Save flow (also refreshes list)
  const saveFlow = useCallback(
    async (updates?: Partial<FlowFile>) => {
      await persistFlow(updates ?? {});
      await loadFlows();
    },
    [persistFlow, loadFlows]
  );

  // Run flow
  const runFlow = useCallback(async () => {
    const flow = activeFlowRef.current;
    if (!flow) return;
    setRunning(true);
    setExecLog(null);
    try {
      const res = await fetch(`/api/flows/${flow.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openai_key: openaiKey || undefined }),
      });
      const data = await res.json();
      setExecLog(data.log);
    } catch (err) {
      setExecLog({
        flowId: flow.id,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        results: [{ nodeId: "root", status: "error", error: err instanceof Error ? err.message : String(err), durationMs: 0 }],
      });
    }
    setRunning(false);
  }, [openaiKey]);

  // Handle node drop from palette
  const handleDrop = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const flow = activeFlowRef.current;
      if (!flow) return;
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

      const updated = { ...flow, nodes: [...flow.nodes, newNode] };
      setActiveFlow(updated);
      persistFlow({ nodes: updated.nodes });
    },
    [persistFlow]
  );

  // Handle node config change
  const handleConfigChange = useCallback(
    (nodeId: string, config: FlowNodeData["config"]) => {
      const flow = activeFlowRef.current;
      if (!flow) return;
      const updatedNodes = flow.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, config } } : n
      );
      setActiveFlow({ ...flow, nodes: updatedNodes });
      // Also update selectedNode so config panel reflects new values
      setSelectedNode((s) => s?.id === nodeId ? { ...s, data: { ...s.data, config } } : s);
      persistFlow({ nodes: updatedNodes });
    },
    [persistFlow]
  );

  // Handle node duplicate from context menu
  const handleNodeDuplicate = useCallback(
    (duplicate: FlowNode) => {
      const flow = activeFlowRef.current;
      if (!flow) return;
      const updated = { ...flow, nodes: [...flow.nodes, duplicate] };
      setActiveFlow(updated);
      persistFlow({ nodes: updated.nodes });
    },
    [persistFlow]
  );

  const handleNodesChange = useCallback((nodes: FlowNode[]) => {
    setActiveFlow((f) => (f ? { ...f, nodes } : f));
  }, []);

  const handleEdgesChange = useCallback((edges: FlowEdge[]) => {
    setActiveFlow((f) => (f ? { ...f, edges } : f));
    persistFlow({ edges });
  }, [persistFlow]);

  // Called when nodes are deleted via keyboard — clear selection if needed
  const handleNodeDelete = useCallback((nodeId: string) => {
    setSelectedNode((s) => (s?.id === nodeId ? null : s));
    // Persist after ReactFlow updates nodesRef (slight delay)
    setTimeout(() => {
      const flow = activeFlowRef.current;
      if (flow) persistFlow({ nodes: flow.nodes.filter((n) => n.id !== nodeId) });
    }, 50);
  }, [persistFlow]);

  return (
    <div className="flex h-[calc(100vh-0px)] bg-gray-50">
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
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            {activeFlow ? (
              <input
                className="bg-transparent border-b border-gray-200 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500 px-1 w-44 transition-colors"
                value={activeFlow.name}
                onChange={(e) => setActiveFlow((f) => f ? { ...f, name: e.target.value } : f)}
                onBlur={() => saveFlow({ name: activeFlowRef.current?.name })}
              />
            ) : (
              <span className="text-sm font-semibold text-gray-400">Automations</span>
            )}
            {saving && <span className="text-[10px] text-gray-400 animate-pulse">Saving…</span>}
          </div>
          <div className="flex items-center gap-2">
            {/* OpenAI key toggle */}
            <div className="relative">
              <button
                onClick={() => setShowKeyInput((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  openaiKey
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
                title="Configure OpenAI API key"
              >
                <span>{openaiKey ? "✓" : "⚠"}</span>
                <span>OpenAI key</span>
              </button>
              {showKeyInput && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-50 w-72">
                  <p className="text-xs text-gray-500 mb-2">OpenAI API key (used by AI nodes)</p>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => saveOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 font-mono"
                    autoFocus
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5">Stored in browser localStorage</p>
                </div>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={!activeFlow || running}
              onClick={runFlow}
              className="text-xs rounded-lg"
            >
              {running ? "⏳ Running…" : "▶ Run"}
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative" onClick={() => setShowKeyInput(false)}>
          {activeFlow ? (
            <FlowCanvas
              key={activeFlowId}
              flow={activeFlow}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onNodeSelect={setSelectedNode}
              onNodeDelete={handleNodeDelete}
              onNodeDuplicate={handleNodeDuplicate}
              onDrop={handleDrop}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-3xl mb-3">⚡</p>
                <p className="text-sm font-medium text-gray-500">Create a new flow to start</p>
                <p className="text-xs text-gray-400 mt-1">Drag nodes from the left panel onto the canvas</p>
              </div>
            </div>
          )}
        </div>

        {/* Execution log drawer */}
        {execLog && (
          <div className="border-t border-gray-100 bg-white max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-700">Execution Log</span>
              <button className="text-xs text-gray-400 hover:text-gray-700" onClick={() => setExecLog(null)}>✕</button>
            </div>
            <div className="p-2 space-y-1">
              {execLog.results.map((r: NodeExecutionResult, i: number) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs ${
                    r.status === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : r.status === "error"
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <span>{r.status === "success" ? "✓" : r.status === "error" ? "✗" : "—"}</span>
                  <span className="font-mono">{r.nodeId}</span>
                  <span className="text-current opacity-60">{r.durationMs}ms</span>
                  {r.error && <span className="truncate ml-2 opacity-80">{r.error}</span>}
                  {r.output != null && (
                    <span className="opacity-60 truncate ml-2">
                      {String(JSON.stringify(r.output)).slice(0, 80)}
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
