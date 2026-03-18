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
  useReactFlow,
  ReactFlowProvider,
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
  onNodeDelete?: (nodeId: string) => void;
  onDrop?: (type: string, position: { x: number; y: number }) => void;
};

function FlowCanvasInner({
  flow,
  onNodesChange: onNodesChangeCb,
  onEdgesChange: onEdgesChangeCb,
  onNodeSelect,
  onNodeDelete,
  onDrop,
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

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
  }, [onNodeSelect]);

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
