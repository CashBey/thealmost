"use client";

import { useEffect, useMemo, useState } from "react";

const MILESTONES: Record<number, string> = {
  2: "still nothing.",
  5: "you’re really doing this.",
  10: "ok.",
  20: "this is becoming a habit.",
  50: "you could stop. but you won’t.",
  100: "nothing has changed. except you.",
  200: "close. (lie)",
  500: "you’re training your hope.",
  1000: "impressive. pointless.",
  2000: "the button remembers.",
  5000: "almost means never.",
  10000: "this is not a game.",
  20000: "you’re still here.",
  50000: "you made a number happen.",
  100000: "ok. you win. (you don’t)",
};

export default function AlmostButton() {
  const [count, setCount] = useState(0);
  const [label, setLabel] = useState("press me");
  const [frozen, setFrozen] = useState(false);

  // keep milestones totally secret: no list, no UI, no reveal trigger
  const milestones = useMemo(() => Object.keys(MILESTONES).map(Number), []);

  useEffect(() => {
    if (MILESTONES[count]) {
      setLabel(MILESTONES[count]);
      return;
    }

    if (count > 0 && count % 137 === 0) {
      setLabel("you ruined it.");
      setTimeout(() => setLabel("press me"), 1200);
    }
  }, [count]);

  const handleClick = () => {
    if (frozen) return;

    setCount((c) => c + 1);

    if (Math.random() < 0.005) {
      setFrozen(true);
      setLabel("...");
      setTimeout(() => {
        setFrozen(false);
        setLabel("press me");
      }, 1500);
      return;
    }

    // keep the small "nothing happened" vibe, but don't expose milestone list
    if (!milestones.includes(count + 1)) {
      setLabel("nothing happened");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-10">
      <div className="text-center space-y-6">
        <button
          onClick={handleClick}
          className={[
            "rounded-2xl border border-black/10 bg-white px-10 py-5 text-lg text-neutral-900 shadow-sm transition",
            "dark:border-white/10 dark:bg-white/10 dark:text-neutral-100",
            frozen ? "opacity-50 cursor-not-allowed" : "hover:shadow-md",
          ].join(" ")}
        >
          {label}
        </button>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          pressed {count} times
        </p>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
          it is closer than it looks.
        </p>
      </div>
    </main>
  );
}
