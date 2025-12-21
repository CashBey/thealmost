"use client";

import { useState } from "react";

export default function CopyLink() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  return (
    <button
      onClick={copy}
      className="mt-8 text-xs opacity-60 hover:opacity-100 transition underline"
    >
      {copied ? "link copied" : "copy link"}
    </button>
  );
}
