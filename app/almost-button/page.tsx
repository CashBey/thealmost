"use client";

import { useEffect, useState } from "react";

const rareMessages = ["almost.", "not yet.", "close.", "try again."];

export default function AlmostButton() {
  const [count, setCount] = useState(0);
  const [label, setLabel] = useState("press me");
  const [frozen, setFrozen] = useState(false);

  useEffect(() => {
    if (count > 0 && count % 137 === 0) {
      setLabel("you ruined it.");
      setTimeout(() => {
        setCount(0);
        setLabel("press me");
      }, 1200);
    }
  }, [count]);

  const handleClick = () => {
    if (frozen) return;

    setCount(c => c + 1);
    const r = Math.random();

    if (r < 0.005) {
      setFrozen(true);
      setLabel("...");
      setTimeout(() => {
        setFrozen(false);
        setLabel("press me");
      }, 1500);
      return;
    }

    if (r < 0.02) {
      setLabel(rareMessages[Math.floor(Math.random() * rareMessages.length)]);
      return;
    }

    setLabel("nothing happened");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-6">
        <button
          onClick={handleClick}
          className={[
            "rounded-2xl border border-black/10 bg-white px-8 py-4 text-lg shadow-sm transition",
            frozen ? "opacity-40 cursor-not-allowed" : "hover:shadow-md",
          ].join(" ")}
        >
          {label}
        </button>

        <p className="text-xs text-neutral-500">pressed {count} times</p>
        <p className="text-[11px] text-neutral-400">it is closer than it looks.</p>
      </div>
    </main>
  );
}