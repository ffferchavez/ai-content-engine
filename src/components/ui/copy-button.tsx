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
      className={`rounded-none border border-black px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ui-text transition hover:bg-neutral-50 ${className}`}
    >
      {state === "copied" ? "Copied" : label}
    </button>
  );
}
