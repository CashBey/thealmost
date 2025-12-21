"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import WhatNext from "../components/WhatNext";
import CopyLink from "../components/CopyLink";

type Choice = "left" | "right";
type Phase = "idle" | "resolving" | "resolved";

function opposite(c: Choice): Choice {
  return c === "left" ? "right" : "left";
}

const LS_COUNT_KEY = "odd:almostChoiceCount";
const LS_LAST_KEY = "odd:lastAlmostChoice";

export default function AlmostChoicePage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [picked, setPicked] = useState<Choice | null>(null);
  const [finalChoice, setFinalChoice] = useState<Choice | null>(null);
  const [hintVisible, setHintVisible] = useState(false);

  const disabled = phase !== "idle";
  const hintTimer = useRef<number | null>(null);

  // Tiny asymmetry that stays stable per refresh
  const micro = useMemo(() => {
    const gap = 26 + Math.floor(Math.random() * 6); // 26–31
    const tilt = (Math.random() * 0.4 - 0.2).toFixed(3); // -0.2..0.2 deg
    const shadowA = 22 + Math.floor(Math.random() * 4); // 22–25
    const shadowB = 20 + Math.floor(Math.random() * 4); // 20–23
    const blurEdge: "left" | "right" = Math.random() < 0.55 ? "left" : "right";
    const hoverDelayRight = 10 + Math.floor(Math.random() * 18); // 10–27ms
    return { gap, tilt, shadowA, shadowB, blurEdge, hoverDelayRight } as const;
  }, []);


  useEffect(() => {
    return () => {
      if (hintTimer.current) window.clearTimeout(hintTimer.current);
    };
  }, []);

  function reset() {
    if (hintTimer.current) window.clearTimeout(hintTimer.current);
    hintTimer.current = null;
    setPhase("idle");
    setPicked(null);
    setFinalChoice(null);
    setHintVisible(false);
  }

  function bumpGlobalOddness(finalPick: Choice) {
    try {
      const raw = window.localStorage.getItem(LS_COUNT_KEY);
      const next = Math.min(9999, Math.max(0, (raw ? parseInt(raw, 10) : 0) || 0) + 1);
      window.localStorage.setItem(LS_COUNT_KEY, String(next));
      window.localStorage.setItem(LS_LAST_KEY, finalPick);
      // nudge other tabs to notice
      window.dispatchEvent(new StorageEvent("storage", { key: LS_COUNT_KEY, newValue: String(next) }));
    } catch {
      // ignore
    }
  }

  async function choose(choice: Choice) {
    if (disabled) return;

    setPicked(choice);
    setPhase("resolving");
    setHintVisible(false);

    // 80% flip (the core “almost” mechanic)
    const flip = Math.random() < 0.8;
    const target = flip ? opposite(choice) : choice;

    // micro delay makes it feel like “did I misclick?”
    const delay = 140 + Math.floor(Math.random() * 140); // 140–279ms
    await new Promise((r) => setTimeout(r, delay));

    setFinalChoice(target);
    setPhase("resolved");

    bumpGlobalOddness(target);

    // quiet, delayed hint (no explanation vibe)
    const hintDelay = 1700 + Math.floor(Math.random() * 1600); // 1.7–3.3s
    hintTimer.current = window.setTimeout(() => setHintVisible(true), hintDelay);
  }

  const resolved = phase === "resolved" && finalChoice;

  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-[#0f0f10] dark:text-neutral-100">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
        <header className="flex items-start justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition"
            >
              ← back
            </Link>

            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              The Almost Choice
            </h1>
            <p className="mt-2 text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
              Two options. One outcome.
            </p>
          </div>

          <button
            onClick={reset}
            className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-white/70 dark:bg-white/5 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300 shadow-sm hover:shadow transition"
          >
            Reset
          </button>
        </header>

        <section className="mt-10">
          <div
            className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-white/[0.02]
                       shadow-[0_14px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.35)]
                       h-[300px] sm:h-[340px]"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-16 left-12 h-40 w-40 rounded-full bg-black opacity-[0.08] blur-3xl dark:opacity-[0.12]" />
              <div className="absolute -bottom-20 right-10 h-48 w-48 rounded-full bg-black opacity-[0.06] blur-3xl dark:opacity-[0.10]" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex items-center justify-center"
                style={{
                  gap: `${micro.gap}px`,
                  transform: `rotate(${micro.tilt}deg)`,
                }}
              >
                <ChoicePill
                  side="left"
                  disabled={disabled}
                  microShadowDepth={micro.shadowA}
                  picked={picked}
                  finalChoice={finalChoice}
                  phase={phase}
                  blurEdge={micro.blurEdge}
                  hoverDelayMs={0}
                  onClick={() => choose("left")}
                />
                <ChoicePill
                  side="right"
                  disabled={disabled}
                  microShadowDepth={micro.shadowB}
                  picked={picked}
                  finalChoice={finalChoice}
                  phase={phase}
                  blurEdge={micro.blurEdge}
                  hoverDelayMs={micro.hoverDelayRight}
                  onClick={() => choose("right")}
                />
              </div>
            </div>

            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center">
              <div className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                {phase === "idle" && <span>Choose.</span>}
                {phase === "resolving" && <span>…</span>}
                {resolved && <span>Selected.</span>}
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-center">
            <div
              className={[
                "text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 transition-opacity duration-700",
                hintVisible && resolved ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              You almost chose.
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center">
            <div className="text-[11px] text-neutral-400 dark:text-neutral-500">
              no labels · no explanation
            </div>
          </div>

          <div className="mt-12">
            <WhatNext currentHref="/almost-choice" />
          </div>
        </section>
      </div>
          <CopyLink />
    </main>
  );
}

function ChoicePill(props: {
  side: Choice;
  disabled: boolean;
  microShadowDepth: number;
  picked: Choice | null;
  finalChoice: Choice | null;
  phase: Phase;
  blurEdge: "left" | "right";
  hoverDelayMs: number;
  onClick: () => void;
}) {
  const { side, disabled, microShadowDepth, picked, finalChoice, phase, blurEdge, hoverDelayMs } = props;

  const resolving = phase === "resolving";
  const resolved = phase === "resolved" && finalChoice;

  const isPicked = picked === side;
  const isFinal = finalChoice === side;

  const pickedStutter = resolving && isPicked ? "translate-y-[1px] blur-[0.25px]" : "";

  const resolvedTransform = resolved
    ? isFinal
      ? "scale-[1.03] -translate-y-0.5 opacity-100"
      : "scale-[0.985] translate-y-1 opacity-0 blur-[0.8px]"
    : "opacity-100";

  const edgeBlur =
    resolved && isFinal
      ? ""
      : blurEdge === side
      ? "after:content-[''] after:absolute after:inset-y-0 after:w-6 after:blur-[0.8px] after:opacity-[0.10] after:bg-black/30 after:rounded-full after:left-0"
      : "after:content-[''] after:absolute after:inset-y-0 after:w-6 after:blur-[0.8px] after:opacity-[0.10] after:bg-black/30 after:rounded-full after:right-0";

  const shadow = `shadow-[0_${Math.max(10, microShadowDepth)}px_${Math.max(
    30,
    microShadowDepth * 2
  )}px_rgba(0,0,0,0.09)] dark:shadow-[0_${Math.max(10, microShadowDepth)}px_${Math.max(
    34,
    microShadowDepth * 2
  )}px_rgba(0,0,0,0.45)]`;

  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={disabled}
      aria-label={side}
      className={[
        "relative select-none rounded-full border border-neutral-200/80 dark:border-neutral-800",
        "bg-white/95 dark:bg-white/[0.06]",
        "w-[150px] h-[72px] sm:w-[170px] sm:h-[78px]",
        "transition-[transform,opacity,filter,box-shadow] duration-500 ease-out",
        shadow,
        disabled
          ? "cursor-default"
          : "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_18px_70px_rgba(0,0,0,0.11)] dark:hover:shadow-[0_18px_90px_rgba(0,0,0,0.6)]",
        pickedStutter,
        resolvedTransform,
        edgeBlur,
      ].join(" ")}
      style={{ transitionDelay: `${disabled ? 0 : hoverDelayMs}ms` }}
    >
      <span
        className="absolute inset-[1px] rounded-full"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)" }}
      />
    </button>
  );
}