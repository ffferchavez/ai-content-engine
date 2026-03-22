"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "copied">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className={`rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-helion-text ${className}`}
    >
      {state === "copied" ? "Copied" : label}
    </button>
  );
}
