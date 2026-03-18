import { NextRequest, NextResponse } from "next/server";
import { callMcpTool } from "@/lib/mcp-client";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tool, args } = body as { tool: string; args?: Record<string, unknown> };

  if (!tool) {
    return NextResponse.json({ error: "Missing tool name" }, { status: 400 });
  }

  try {
    const result = await callMcpTool(tool, args ?? {});
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
