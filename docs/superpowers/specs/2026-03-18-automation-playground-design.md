# Automation Playground — Design Spec

**Date:** 2026-03-18  
**Status:** Approved

## Problem

clix users need a way to create Twitter/X automations visually — without writing code. They want to chain actions (like, reply, follow, DM) with triggers (schedule, event, manual) and AI-generated content, similar to n8n.

## Solution

A dedicated `/automations` page in the clix frontend with a React Flow canvas. Users drag-and-drop nodes representing triggers, actions, AI steps, and logic. Flows are saved as JSON files in `~/.config/clix/flows/`. Execution runs server-side via Next.js API routes calling the clix MCP bridge.

## Page Layout

```
/automations
├── Left panel (240px)  — flow list + "New Flow" button
├── Center (flex-1)     — React Flow canvas (main workspace)
└── Right panel (320px) — node config panel (shown when node selected)
```

## Node Catalogue

### Trigger Nodes (blue)
| Node | Description |
|------|-------------|
| Manual | Run button — no automatic trigger |
| Schedule | Cron expression (e.g. `0 9 * * 1-5`) |
| New Mention | Polls `search` for mentions every N minutes |
| New Follower | Polls `get_user` followers delta |
| New DM | Polls `dm_inbox` for new messages |

### Action Nodes (green)
| Node | MCP Tool |
|------|----------|
| Post Tweet | `post_tweet` |
| Reply | `post_tweet` with `reply_to` |
| Like | `like` |
| Retweet | `retweet` |
| Follow User | `follow` |
| Unfollow User | `unfollow` |
| Send DM | `dm_send` |
| Bookmark | `bookmark` |

### AI Nodes (purple)
| Node | Description |
|------|-------------|
| AI Generate | GPT-4o — generates tweet text from a user-defined prompt template |
| AI Reply | GPT-4o — reads incoming tweet context, generates contextual reply |

### Logic Nodes (yellow)
| Node | Description |
|------|-------------|
| Condition | if/else branch based on field value or regex |
| Delay | wait N seconds/minutes before next node |

## Data Flow

Nodes pass a **context object** downstream:
```ts
type FlowContext = {
  tweet?: Tweet        // from trigger or previous node
  text?: string        // generated or input text
  handle?: string      // target user
  [key: string]: unknown
}
```

Each node reads from context, performs its action, and merges its output back into context for the next node.

## Execution Engine

```
POST /api/flows/[id]/run
  1. Load flow JSON from ~/.config/clix/flows/[id].json
  2. Build execution graph (topological sort from trigger node)
  3. For each node in order:
     - Action/Trigger nodes → call /api/mcp/call
     - AI nodes → call OpenAI API (key from settings/env)
     - Logic nodes → evaluate condition, branch
  4. Return execution log (node id → result/error)
```

## Storage

**File path:** `~/.config/clix/flows/{id}.json`

```ts
type FlowFile = {
  id: string           // nanoid
  name: string
  nodes: RFNode[]      // React Flow nodes (position + data)
  edges: RFEdge[]      // React Flow edges
  trigger: {
    type: "manual" | "schedule" | "mention" | "follower" | "dm"
    cron?: string      // for schedule trigger
    intervalMs?: number // for event polling
  }
  createdAt: string    // ISO
  updatedAt: string
}
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/flows` | List all flows from ~/.config/clix/flows/ |
| POST | `/api/flows` | Create new flow (generate id, write file) |
| GET | `/api/flows/[id]` | Load single flow |
| PUT | `/api/flows/[id]` | Save/update flow |
| DELETE | `/api/flows/[id]` | Delete flow file |
| POST | `/api/flows/[id]/run` | Execute flow (manual trigger) |

## Dependencies

- `@xyflow/react` — React Flow v12 canvas
- `openai` — OpenAI SDK for AI nodes
- `cronstrue` — human-readable cron display
- `nanoid` — flow ID generation

## Out of Scope (v1)

- Persistent background scheduler (event/schedule triggers run manually for now; future: a Node.js cron worker)
- Multi-account flows
- Flow version history
- Webhook triggers
