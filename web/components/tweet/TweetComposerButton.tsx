"use client";

import { Feather } from "lucide-react";
import { useState } from "react";
import { TweetComposer } from "./TweetComposer";

export function TweetComposerButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full font-bold text-sm transition-opacity hover:opacity-90"
        style={{ background: "#1d9bf0", color: "#fff" }}
      >
        <Feather size={18} />
        <span>New Tweet</span>
      </button>

      {open && <TweetComposer onClose={() => setOpen(false)} />}
    </>
  );
}
