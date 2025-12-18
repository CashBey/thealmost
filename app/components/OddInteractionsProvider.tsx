"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

type OddFlags = {
  hoverDelay: boolean;
  thumbBlur: boolean;
  microShift: boolean;
};

type Odds = {
  hoverDelay: number;
  thumbBlur: number;
  microShift: number;
};

function rand01() {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] / 0xffffffff;
}

function pickFlags(odds: Odds): OddFlags {
  return {
    hoverDelay: rand01() < odds.hoverDelay,
    thumbBlur: rand01() < odds.thumbBlur,
    microShift: rand01() < odds.microShift,
  };
}

function getOddsForPath(pathname: string): Odds {
  const base: Odds = { hoverDelay: 0.04, thumbBlur: 0.03, microShift: 0.02 };

  // homepage: slightly more noticeable, still subtle
  if (pathname === "/" || pathname === "") {
    return { hoverDelay: 0.08, thumbBlur: 0.06, microShift: 0.04 };
  }

  if (pathname.includes("the-waiting-game")) {
    return { hoverDelay: 0.09, thumbBlur: 0.06, microShift: 0.05 };
  }
  if (pathname.includes("how-manipulable-are-you")) {
    return { hoverDelay: 0.06, thumbBlur: 0.04, microShift: 0.03 };
  }
  if (pathname.includes("choice-engine")) {
    return { hoverDelay: 0.03, thumbBlur: 0.02, microShift: 0.01 };
  }
  if (pathname.includes("you-are-not-special")) {
    return { hoverDelay: 0.03, thumbBlur: 0.02, microShift: 0.01 };
  }
  if (pathname.includes("spend-satoshi")) {
    return { hoverDelay: 0.05, thumbBlur: 0.03, microShift: 0.02 };
  }

  return base;
}

export default function OddInteractionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  const odds = useMemo(() => getOddsForPath(pathname), [pathname]);

  useEffect(() => {
    const html = document.documentElement;

    const isHome = pathname === "/" || pathname === "";

    // Global mood: becomes slightly more noticeable after you play certain experiments.
    // (Stored in localStorage so it persists across sessions.)
    let mood = 0;
    try {
      const raw = window.localStorage.getItem("odd:almostChoiceCount");
      const count = raw ? parseInt(raw, 10) : 0;
      // mood levels: 0..3 (subtle)
      mood = Math.max(0, Math.min(3, Math.floor((count || 0) / 2)));
    } catch {}

    // Route-aware cache key: each experiment can feel slightly different,
    // but stays stable within the same tab session.
    const key = `odd_fun_flags_v2:${pathname}:m${mood}`;
    let flags: OddFlags | null = null;

    try {
      const cached = sessionStorage.getItem(key);
      if (cached) flags = JSON.parse(cached) as OddFlags;
    } catch {}

    if (!flags) {
      flags = pickFlags(odds);
      try {
        sessionStorage.setItem(key, JSON.stringify(flags));
      } catch {}
    }

    html.dataset.oddHover = flags.hoverDelay ? "1" : "0";
    html.dataset.oddThumb = flags.thumbBlur ? "1" : "0";
    html.dataset.oddShift = flags.microShift ? "1" : "0";

    html.style.setProperty("--odd-hover-delay", flags.hoverDelay ? (isHome ? "120ms" : "90ms") : "0ms");
    html.style.setProperty("--odd-thumb-blur", flags.thumbBlur ? (isHome ? "0.9px" : "0.7px") : "0px");
    html.style.setProperty("--odd-shift-x", flags.microShift ? (isHome ? "2px" : "1px") : "0px");
    // mood gently amplifies the effect (still subtle)
    if (mood > 0) {
      const baseDelay = flags.hoverDelay ? (isHome ? 120 : 90) : 0;
      const baseBlur = flags.thumbBlur ? (isHome ? 0.9 : 0.7) : 0;
      const baseShift = flags.microShift ? (isHome ? 2 : 1) : 0;
      const mul = 1 + mood * 0.18;
      html.style.setProperty("--odd-hover-delay", `${Math.round(baseDelay * mul)}ms`);
      html.style.setProperty("--odd-thumb-blur", `${(baseBlur * mul).toFixed(2)}px`);
      html.style.setProperty("--odd-shift-x", `${Math.round(baseShift * mul)}px`);
    }
  }, [pathname, odds]);

  return <>{children}</>;
}
