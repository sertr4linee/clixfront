import { NextResponse } from "next/server";
import { readFile, writeFile, unlink } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import type { FlowFile } from "@/lib/flows/types";

const FLOWS_DIR = join(homedir(), ".config", "clix", "flows");

function flowPath(id: string) {
  // Prevent path traversal
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "");
  return join(FLOWS_DIR, `${safe}.json`);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const raw = await readFile(flowPath(id), "utf-8");
    const flow: FlowFile = JSON.parse(raw);
    return NextResponse.json({ flow });
  } catch {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    let existing: FlowFile;
    try {
      const raw = await readFile(flowPath(id), "utf-8");
      existing = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    const updated: FlowFile = {
      ...existing,
      name: body.name ?? existing.name,
      nodes: body.nodes ?? existing.nodes,
      edges: body.edges ?? existing.edges,
      trigger: body.trigger ?? existing.trigger,
      updatedAt: new Date().toISOString(),
    };

    await writeFile(flowPath(id), JSON.stringify(updated, null, 2));
    return NextResponse.json({ flow: updated });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await unlink(flowPath(id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }
}
