"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";
import { authApi } from "@/lib/api";

export default function SettingsPage() {
  const { data: auth, isLoading } = useQuery({
    queryKey: ["auth"],
    queryFn: authApi.status,
  });

  return (
    <div className="max-w-xl mx-auto">
      <div
        className="sticky top-0 z-10 px-4 py-4 font-bold text-lg backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.8)", borderBottom: "1px solid #2f3336", color: "#e7e9ea" }}
      >
        Settings
      </div>

      <div className="p-4 space-y-4">
        {/* Auth status */}
        <div
          className="p-4 rounded-xl"
          style={{ background: "#16181c", border: "1px solid #2f3336" }}
        >
          <h2 className="font-bold mb-3" style={{ color: "#e7e9ea" }}>Authentication</h2>

          {isLoading ? (
            <div className="h-6 w-32 rounded animate-pulse" style={{ background: "#2f3336" }} />
          ) : (
            <div className="flex items-center gap-2">
              {auth?.authenticated ? (
                <>
                  <CheckCircle size={18} style={{ color: "#00ba7c" }} />
                  <span className="text-sm" style={{ color: "#e7e9ea" }}>
                    Connected as <strong>{auth.account || "default account"}</strong>
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={18} style={{ color: "#f4212e" }} />
                  <span className="text-sm" style={{ color: "#71767b" }}>
                    Not authenticated. Run{" "}
                    <code className="px-1 py-0.5 rounded text-xs" style={{ background: "#2f3336", color: "#e7e9ea" }}>
                      clix auth login
                    </code>{" "}
                    in your terminal.
                  </span>
                </>
              )}
            </div>
          )}

          {auth?.accounts && auth.accounts.length > 0 && (
            <div className="mt-3">
              <p className="text-xs mb-2" style={{ color: "#71767b" }}>Available accounts</p>
              <div className="flex flex-wrap gap-2">
                {auth.accounts.map((a: string) => (
                  <span
                    key={a}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: a === auth.account ? "#1d9bf01a" : "#202327",
                      color: a === auth.account ? "#1d9bf0" : "#71767b",
                      border: `1px solid ${a === auth.account ? "#1d9bf040" : "#2f3336"}`,
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Server info */}
        <div
          className="p-4 rounded-xl"
          style={{ background: "#16181c", border: "1px solid #2f3336" }}
        >
          <h2 className="font-bold mb-2" style={{ color: "#e7e9ea" }}>Server</h2>
          <p className="text-sm" style={{ color: "#71767b" }}>
            API server:{" "}
            <code className="px-1 rounded" style={{ background: "#202327", color: "#e7e9ea" }}>
              localhost:8000
            </code>
          </p>
          <p className="text-sm mt-1" style={{ color: "#71767b" }}>
            Start with:{" "}
            <code className="px-1 rounded" style={{ background: "#202327", color: "#e7e9ea" }}>
              uvicorn server.main:app --reload --port 8000
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
