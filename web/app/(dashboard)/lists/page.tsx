"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { List, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { listsApi } from "@/lib/api";
import type { TwitterList } from "@/lib/types";

export default function ListsPage() {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const qc = useQueryClient();

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["lists"],
    queryFn: listsApi.getLists,
  });

  const createMut = useMutation({
    mutationFn: () => listsApi.create({ name: newName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists"] });
      setNewName("");
      setCreating(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => listsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  });

  return (
    <div className="max-w-xl mx-auto">
      <div
        className="sticky top-0 z-10 px-4 py-4 flex items-center justify-between backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.8)", borderBottom: "1px solid #2f3336" }}
      >
        <h1 className="font-bold text-lg" style={{ color: "#e7e9ea" }}>Lists</h1>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold"
          style={{ background: "#e7e9ea", color: "#000" }}
        >
          <Plus size={14} /> New
        </button>
      </div>

      {creating && (
        <div className="p-4" style={{ borderBottom: "1px solid #2f3336" }}>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="List name"
              autoFocus
              className="flex-1 px-3 py-2 rounded-lg outline-none text-sm"
              style={{ background: "#202327", color: "#e7e9ea" }}
            />
            <button
              onClick={() => newName.trim() && createMut.mutate()}
              disabled={!newName.trim() || createMut.isPending}
              className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-40"
              style={{ background: "#1d9bf0", color: "#fff" }}
            >
              Create
            </button>
            <button
              onClick={() => { setCreating(false); setNewName(""); }}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ color: "#71767b" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="p-8 text-center" style={{ color: "#71767b" }}>Loading lists...</div>
      )}

      {(lists as TwitterList[]).map((l) => (
        <div
          key={l.id}
          className="flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer"
          style={{ borderBottom: "1px solid #2f3336" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#080808")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#16181c" }}
          >
            <List size={18} style={{ color: "#1d9bf0" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm" style={{ color: "#e7e9ea" }}>{l.name}</p>
            {l.description && (
              <p className="text-xs truncate" style={{ color: "#71767b" }}>{l.description}</p>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); deleteMut.mutate(l.id); }}
            className="p-1 rounded-full hover:bg-red-500/10 transition-colors"
            style={{ color: "#71767b" }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {!isLoading && lists.length === 0 && !creating && (
        <div className="p-8 text-center" style={{ color: "#71767b" }}>
          No lists yet. Create one to get started.
        </div>
      )}
    </div>
  );
}
