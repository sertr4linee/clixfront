"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  addEdge,
  type Connection,
  type OnConnect,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { AutomationNode } from "./nodes/automation-node";
import type { FlowNode, FlowEdge, FlowFile, FlowNodeData } from "@/lib/flows/types";
import { NODE_CATALOGUE, CATEGORY_COLORS, getNodeCategory } from "@/lib/flows/types";

type ContextMenu = {
  nodeId: string;
  label: string;
  x: number;
  y: number;
};

function NodeContextMenu({
  menu,
  onClose,
  onDelete,
  onDuplicate,
  onConfigure,
}: {
  menu: ContextMenu;
  onClose: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onConfigure: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const items = [
    { icon: "⚙️", label: "Configure", action: () => { onConfigure(menu.nodeId); onClose(); } },
    { icon: "⧉", label: "Duplicate", action: () => { onDuplicate(menu.nodeId); onClose(); } },
    { divider: true },
    { icon: "🗑", label: "Delete", action: () => { onDelete(menu.nodeId); onClose(); }, danger: true },
  ];

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-[160px] overflow-hidden"
      style={{ left: menu.x, top: menu.y }}
    >
      <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate block">
          {menu.label}
        </span>
      </div>
      {items.map((item, i) =>
        "divider" in item ? (
          <div key={i} className="my-1 border-t border-gray-100" />
        ) : (
          <button
            key={i}
            onClick={item.action}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors text-left ${
              item.danger
                ? "text-red-600 hover:bg-red-50"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        )
      )}
    </div>
  );
}

const nodeTypes = { automation: AutomationNode };

type FlowCanvasProps = {
  flow: FlowFile | null;
  onNodesChange?: (nodes: FlowNode[]) => void;
  onEdgesChange?: (edges: FlowEdge[]) => void;
  onNodeSelect?: (node: FlowNode | null) => void;
  onNodeDelete?: (nodeId: string) => void;
  onNodeDuplicate?: (node: FlowNode) => void;
  onDrop?: (type: string, position: { x: number; y: number }) => void;
};

function FlowCanvasInner({
  flow,
  onNodesChange: onNodesChangeCb,
  onEdgesChange: onEdgesChangeCb,
  onNodeSelect,
  onNodeDelete,
  onNodeDuplicate,
  onDrop,
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, deleteElements } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

  // Convert flow nodes to have the "automation" type for rendering
  const initialNodes = useMemo(
    () =>
      (flow?.nodes ?? []).map((n) => ({
        ...n,
        type: "automation",
      })),
    [flow?.nodes]
  );

  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(flow?.edges ?? []);

  // Sync external changes
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const edgesRef = useRef(edges);
  edgesRef.current = edges;

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(
        { ...connection, animated: true, style: { stroke: "#94A3B8" } },
        eds
      ));
      // Defer: calling parent setState inside setEdges updater triggers "setState during render"
      setTimeout(() => onEdgesChangeCb?.(edgesRef.current as FlowEdge[]), 0);
    },
    [setEdges, onEdgesChangeCb, edgesRef]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      onNodeSelect?.(node);
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null);
    setContextMenu(null);
  }, [onNodeSelect]);

  const onNodeContextMenu = useCallback(
    (e: React.MouseEvent, node: Node) => {
      e.preventDefault();
      const flowNode = node as FlowNode;
      setContextMenu({
        nodeId: flowNode.id,
        label: (flowNode.data as FlowNodeData).label,
        x: e.clientX,
        y: e.clientY,
      });
      onNodeSelect?.(flowNode);
    },
    [onNodeSelect]
  );

  const handleContextDelete = useCallback(
    (nodeId: string) => {
      deleteElements({ nodes: [{ id: nodeId }] });
      onNodeDelete?.(nodeId);
      setTimeout(() => onNodesChangeCb?.(nodesRef.current as FlowNode[]), 50);
    },
    [deleteElements, onNodeDelete, onNodesChangeCb]
  );

  const handleContextDuplicate = useCallback(
    (nodeId: string) => {
      const source = nodesRef.current.find((n) => n.id === nodeId) as FlowNode | undefined;
      if (!source) return;
      const duplicate: FlowNode = {
        ...source,
        id: `${source.id}-copy-${Date.now()}`,
        position: { x: source.position.x + 40, y: source.position.y + 40 },
        data: { ...(source.data as FlowNodeData) },
      };
      onNodeDuplicate?.(duplicate);
    },
    [onNodeDuplicate]
  );

  const handleContextConfigure = useCallback(
    (nodeId: string) => {
      const node = nodesRef.current.find((n) => n.id === nodeId) as FlowNode | undefined;
      if (node) onNodeSelect?.(node);
    },
    [onNodeSelect]
  );

  const onNodesDelete = useCallback(
    (deleted: FlowNode[]) => {
      deleted.forEach((n) => onNodeDelete?.(n.id));
      setTimeout(() => onNodesChangeCb?.(nodesRef.current as FlowNode[]), 0);
    },
    [onNodeDelete, onNodesChangeCb, nodesRef]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow");
      if (!type) return;
      // Use React Flow's screenToFlowPosition for accurate coordinate conversion
      // regardless of zoom/pan state
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      onDrop?.(type, position);
    },
    [onDrop, screenToFlowPosition]
  );

  // Notify parent of node changes for saving
  const wrappedNodesChange = useCallback(
    (changes: Parameters<typeof handleNodesChange>[0]) => {
      handleNodesChange(changes);
      setTimeout(() => onNodesChangeCb?.(nodesRef.current as FlowNode[]), 0);
    },
    [handleNodesChange, onNodesChangeCb]
  );

  const wrappedEdgesChange = useCallback(
    (changes: Parameters<typeof handleEdgesChange>[0]) => {
      handleEdgesChange(changes);
      setTimeout(() => onEdgesChangeCb?.(edgesRef.current as FlowEdge[]), 0);
    },
    [handleEdgesChange, onEdgesChangeCb]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={wrappedNodesChange}
        onEdgesChange={wrappedEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        onDragOver={onDragOver}
        onDrop={handleDrop}
        onNodesDelete={onNodesDelete}
        deleteKeyCode={["Delete", "Backspace"]}
        fitView
        className="bg-gray-50"
        defaultEdgeOptions={{ animated: true, style: { stroke: "#94A3B8" } }}
      >
        <Controls className="!bg-white !border-gray-200 !shadow-md [&_button]:!bg-white [&_button]:!border-gray-200 [&_button]:!text-gray-600 [&_button:hover]:!bg-gray-50" />
        <MiniMap
          className="!bg-gray-50 !border-gray-200"
          nodeColor="#CBD5E1"
          maskColor="rgba(241,245,249,0.7)"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#CBD5E1" />
      </ReactFlow>

      {contextMenu && (
        <NodeContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
          onDelete={handleContextDelete}
          onDuplicate={handleContextDuplicate}
          onConfigure={handleContextConfigure}
        />
      )}
    </div>
  );
}

export function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

export { useNodesState, useEdgesState } from "@xyflow/react";
