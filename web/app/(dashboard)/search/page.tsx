"use client";

import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { feedApi } from "@/lib/api";
import { TweetCard } from "@/components/tweet/TweetCard";

const TYPES = ["Top", "Latest", "Photos", "Videos"] as const;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [type, setType] = useState<string>("Top");

  const { data, isLoading } = useQuery({
    queryKey: ["search", submitted, type],
    queryFn: () => feedApi.search(submitted, type, 20),
    enabled: submitted.length > 0,
  });

  return (
    <div className="max-w-xl mx-auto">
      {/* Search bar */}
      <div
        className="sticky top-0 z-10 p-3"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid #2f3336" }}
      >
        <form
          onSubmit={(e) => { e.preventDefault(); setSubmitted(query); }}
          className="flex items-center gap-3 px-4 py-2 rounded-full"
          style={{ background: "#202327" }}
        >
          <Search size={18} style={{ color: "#71767b" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search X"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "#e7e9ea" }}
          />
        </form>

        {submitted && (
          <div className="flex gap-1 mt-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="px-3 py-1 rounded-full text-xs transition-colors"
                style={{
                  background: type === t ? "#1d9bf0" : "#202327",
                  color: type === t ? "#fff" : "#71767b",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {!submitted && (
        <div className="p-8 text-center" style={{ color: "#71767b" }}>
          Search for tweets, people, and more
        </div>
      )}

      {isLoading && submitted && (
        <div className="p-4 text-center" style={{ color: "#71767b" }}>
          Searching...
        </div>
      )}

      {data?.tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} queryKey={["search", submitted, type]} />
      ))}

      {data && data.tweets.length === 0 && (
        <div className="p-8 text-center" style={{ color: "#71767b" }}>
          No results for &quot;{submitted}&quot;
        </div>
      )}
    </div>
  );
}
