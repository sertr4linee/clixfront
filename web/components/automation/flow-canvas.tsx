"use client";

import { useCallback, useMemo, useRef } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { AutomationNode } from "./nodes/automation-node";
import type { FlowNode, FlowEdge, FlowFile, FlowNodeData } from "@/lib/flows/types";

const nodeTypes = { automation: AutomationNode };

type FlowCanvasProps = {
  flow: FlowFile | null;
  onNodesChange?: (nodes: FlowNode[]) => void;
  onEdgesChange?: (edges: FlowEdge[]) => void;
  onNodeSelect?: (node: FlowNode | null) => void;
  onDrop?: (type: string, position: { x: number; y: number }) => void;
};

export function FlowCanvas({
  flow,
  onNodesChange: onNodesChangeCb,
  onEdgesChange: onEdgesChangeCb,
  onNodeSelect,
  onDrop,
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

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
      setEdges((eds) => {
        const newEdges = addEdge(
          { ...connection, animated: true, style: { stroke: "#666" } },
          eds
        );
        onEdgesChangeCb?.(newEdges as FlowEdge[]);
        return newEdges;
      });
    },
    [setEdges, onEdgesChangeCb]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      onNodeSelect?.(node);
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: e.clientX - bounds.left - 80,
        y: e.clientY - bounds.top - 20,
      };
      onDrop?.(type, position);
    },
    [onDrop]
  );

  // Notify parent of node changes for saving
  const wrappedNodesChange = useCallback(
    (changes: Parameters<typeof handleNodesChange>[0]) => {
      handleNodesChange(changes);
      // Defer to get updated nodes
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
        onDragOver={onDragOver}
        onDrop={handleDrop}
        fitView
        className="bg-zinc-950"
        defaultEdgeOptions={{ animated: true, style: { stroke: "#555" } }}
      >
        <Controls className="!bg-zinc-800 !border-zinc-700 !shadow-lg [&_button]:!bg-zinc-800 [&_button]:!border-zinc-700 [&_button]:!text-zinc-300 [&_button:hover]:!bg-zinc-700" />
        <MiniMap
          className="!bg-zinc-900 !border-zinc-700"
          nodeColor="#555"
          maskColor="rgba(0,0,0,0.6)"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#333" />
      </ReactFlow>
    </div>
  );
}

export { useNodesState, useEdgesState } from "@xyflow/react";
