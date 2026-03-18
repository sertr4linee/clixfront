import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import type {
  FlowFile,
  FlowNode,
  FlowContext,
  NodeExecutionResult,
  FlowExecutionLog,
  AIConfig,
  ActionConfig,
  ConditionConfig,
  DelayConfig,
} from "@/lib/flows/types";
import { callMcpTool } from "@/lib/mcp-client";

const FLOWS_DIR = join(homedir(), ".config", "clix", "flows");

function flowPath(id: string) {
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "");
  return join(FLOWS_DIR, `${safe}.json`);
}

/** Resolve {{field}} placeholders in a string against context. */
function interpolate(template: string, ctx: FlowContext): string {
  return template.replace(/\{\{(.+?)\}\}/g, (_, key: string) => {
    const parts = key.trim().split(".");
    let val: unknown = ctx;
    for (const p of parts) {
      if (val && typeof val === "object") val = (val as Record<string, unknown>)[p];
      else return "";
    }
    return String(val ?? "");
  });
}

/** Topological sort of nodes via edges. Returns node ids in execution order. */
function topoSort(flow: FlowFile): string[] {
  const adj = new Map<string, string[]>();
  const inDeg = new Map<string, number>();

  for (const n of flow.nodes) {
    adj.set(n.id, []);
    inDeg.set(n.id, 0);
  }

  for (const e of flow.edges) {
    adj.get(e.source)?.push(e.target);
    inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
  }

  const queue = flow.nodes
    .filter((n) => (inDeg.get(n.id) ?? 0) === 0)
    .map((n) => n.id);
  const sorted: string[] = [];

  while (queue.length) {
    const id = queue.shift()!;
    sorted.push(id);
    for (const next of adj.get(id) ?? []) {
      const deg = (inDeg.get(next) ?? 1) - 1;
      inDeg.set(next, deg);
      if (deg === 0) queue.push(next);
    }
  }

  return sorted;
}

/** Call OpenAI for AI nodes. */
async function callOpenAI(config: AIConfig, ctx: FlowContext, openaiKey?: string): Promise<string> {
  const apiKey = openaiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key not configured. Set it in the Automations toolbar.");

  const prompt = interpolate(config.prompt || "", ctx);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 280,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/** Execute a single node. */
async function executeNode(
  node: FlowNode,
  ctx: FlowContext,
  openaiKey?: string
): Promise<{ output: unknown; ctx: FlowContext }> {
  const cfg = node.data.config;
  const type = node.data.type;

  switch (type) {
    // ── Triggers (just pass through) ──
    case "trigger-manual":
    case "trigger-schedule":
    case "trigger-mention":
    case "trigger-follower":
    case "trigger-dm":
      return { output: { triggered: true }, ctx };

    // ── Actions ──
    case "action-post": {
      const ac = cfg as ActionConfig;
      const text = interpolate(ac.text || ctx.text || "", ctx);
      const result = await callMcpTool("post_tweet", { text });
      return { output: result, ctx: { ...ctx, text } };
    }
    case "action-reply": {
      const ac = cfg as ActionConfig;
      const text = interpolate(ac.text || ctx.text || "", ctx);
      const replyTo = ctx.tweet?.id || "";
      const result = await callMcpTool("post_tweet", {
        text,
        reply_to: replyTo,
      });
      return { output: result, ctx: { ...ctx, text } };
    }
    case "action-like": {
      const tweetId = ctx.tweet?.id || "";
      const result = await callMcpTool("like", { tweet_id: tweetId });
      return { output: result, ctx };
    }
    case "action-retweet": {
      const tweetId = ctx.tweet?.id || "";
      const result = await callMcpTool("retweet", { tweet_id: tweetId });
      return { output: result, ctx };
    }
    case "action-follow": {
      const ac = cfg as ActionConfig;
      const handle = ac.handle || ctx.handle || ctx.tweet?.author_handle || "";
      const result = await callMcpTool("follow", { handle });
      return { output: result, ctx: { ...ctx, handle } };
    }
    case "action-unfollow": {
      const ac = cfg as ActionConfig;
      const handle = ac.handle || ctx.handle || "";
      const result = await callMcpTool("unfollow", { handle });
      return { output: result, ctx: { ...ctx, handle } };
    }
    case "action-dm": {
      const ac = cfg as ActionConfig;
      const handle = ac.handle || ctx.handle || "";
      const text = interpolate(ac.text || ctx.text || "", ctx);
      const result = await callMcpTool("dm_send", { handle, text });
      return { output: result, ctx: { ...ctx, text, handle } };
    }
    case "action-bookmark": {
      const tweetId = ctx.tweet?.id || "";
      const result = await callMcpTool("bookmark", { tweet_id: tweetId });
      return { output: result, ctx };
    }

    // ── AI ──
    case "ai-generate": {
      const text = await callOpenAI(cfg as AIConfig, ctx, openaiKey);
      return { output: { text }, ctx: { ...ctx, text } };
    }
    case "ai-reply": {
      const text = await callOpenAI(cfg as AIConfig, ctx, openaiKey);
      return { output: { text }, ctx: { ...ctx, text } };
    }

    // ── Logic ──
    case "logic-condition": {
      const cc = cfg as ConditionConfig;
      const fieldVal = String(
        interpolate(`{{${cc.field}}}`, ctx)
      );
      let pass = false;
      switch (cc.operator) {
        case "equals":
          pass = fieldVal === cc.value;
          break;
        case "contains":
          pass = fieldVal.includes(cc.value);
          break;
        case "matches":
          pass = new RegExp(cc.value).test(fieldVal);
          break;
        case "gt":
          pass = Number(fieldVal) > Number(cc.value);
          break;
        case "lt":
          pass = Number(fieldVal) < Number(cc.value);
          break;
      }
      return { output: { pass }, ctx: { ...ctx, conditionResult: pass } };
    }
    case "logic-delay": {
      const dc = cfg as DelayConfig;
      await new Promise((r) => setTimeout(r, dc.seconds * 1000));
      return { output: { delayed: dc.seconds }, ctx };
    }
    default:
      return { output: null, ctx };
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startedAt = new Date().toISOString();
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const openaiKey: string | undefined = body.openai_key || undefined;

  let flow: FlowFile;
  try {
    const raw = await readFile(flowPath(id), "utf-8");
    flow = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  const sorted = topoSort(flow);
  const nodeMap = new Map(flow.nodes.map((n) => [n.id, n]));
  const results: NodeExecutionResult[] = [];
  let ctx: FlowContext = {};

  for (const nodeId of sorted) {
    const node = nodeMap.get(nodeId);
    if (!node) continue;

    const start = Date.now();
    try {
      const res = await executeNode(node, ctx, openaiKey);
      ctx = res.ctx;
      results.push({
        nodeId,
        status: "success",
        output: res.output,
        durationMs: Date.now() - start,
      });
    } catch (err) {
      results.push({
        nodeId,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      });
      // Stop on error
      break;
    }
  }

  const log: FlowExecutionLog = {
    flowId: id,
    startedAt,
    finishedAt: new Date().toISOString(),
    results,
  };

  return NextResponse.json({ log });
}
