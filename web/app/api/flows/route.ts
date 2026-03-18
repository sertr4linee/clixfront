import { NextResponse } from "next/server";
import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { nanoid } from "nanoid";
import type { FlowFile } from "@/lib/flows/types";

const FLOWS_DIR = join(homedir(), ".config", "clix", "flows");

async function ensureDir() {
  await mkdir(FLOWS_DIR, { recursive: true });
}

export async function GET() {
  try {
    await ensureDir();
    const files = await readdir(FLOWS_DIR);
    const flows: FlowFile[] = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = await readFile(join(FLOWS_DIR, file), "utf-8");
        flows.push(JSON.parse(raw));
      } catch {
        // skip invalid files
      }
    }

    flows.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return NextResponse.json({ flows });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureDir();
    const body = await request.json();
    const now = new Date().toISOString();
    const flow: FlowFile = {
      id: nanoid(12),
      name: body.name || "Untitled Flow",
      nodes: body.nodes || [],
      edges: body.edges || [],
      trigger: body.trigger || { type: "manual" },
      createdAt: now,
      updatedAt: now,
    };

    await writeFile(
      join(FLOWS_DIR, `${flow.id}.json`),
      JSON.stringify(flow, null, 2)
    );

    return NextResponse.json({ flow }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
