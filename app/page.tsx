"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { EXPERIMENT_CARDS } from "../lib/experiments";
import DonateCrypto from "./components/DonateCrypto";


function formatNumber(n: number) {
  try {
    return new Intl.NumberFormat("en-US").format(n);
  } catch {
    return String(n);
  }
}

/**
 * “Global” counter MVP (no backend):
 * - Persist a base count in localStorage
 * - Inflate slightly between sessions
 * - Increment on click
 * Later: swap implementation to Supabase/Firebase for true global.
 */
function useFakeGlobalCounter(key = "odd-fun-nothing-count") {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const baseKey = key;
    const seenKey = `${key}:last_seen`;

    const raw = window.localStorage.getItem(baseKey);
    const rawSeen = window.localStorage.getItem(seenKey);

    let c = raw ? Number(raw) : NaN;
    if (!Number.isFinite(c) || c <= 0) {
      // Start with a believable number (stable per user).
      c = 9000 + Math.floor(Math.random() * 12000);
    }

    const now = Date.now();
    const lastSeen = rawSeen ? Number(rawSeen) : NaN;

    // Small “global drift” if the user returns after a while.
    if (Number.isFinite(lastSeen)) {
      const hours = (now - lastSeen) / (1000 * 60 * 60);
      if (hours >= 2) {
        c += 1 + Math.floor(Math.random() * 3);
      }
    } else {
      // First visit: tiny bump
      c += Math.floor(Math.random() * 2);
    }

    window.localStorage.setItem(baseKey, String(c));
    window.localStorage.setItem(seenKey, String(now));
    setCount(c);
  }, [key]);

  const increment = () => {
    setCount((prev) => {
      const next = prev + 1;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, String(next));
      }
      return next;
    });
  };

  return { count, increment };
}

export default function HomePage() {
  const experiments = useMemo(() => EXPERIMENT_CARDS, []);
  const featured = useMemo(
    () => experiments.find((e) => !e.disabled && !!e.href) ?? experiments[0],
    [experiments]
  );

  // micro touch #1: delayed reveal (logo first, then grid)
  const [showGrid, setShowGrid] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setShowGrid(true), 500);
    return () => window.clearTimeout(t);
  }, []);

  // odd interactions
  const { count: nothingCount, increment: bumpNothing } = useFakeGlobalCounter();

  const [uselessChecked, setUselessChecked] = useState(false);

  const [showUselessNote, setShowUselessNote] = useState(false);
  const uselessNoteTimer = useRef<number | null>(null);

  const [dontClickLabel, setDontClickLabel] = useState("do not click");
  const [dontClickNote, setDontClickNote] = useState("seriously.");

  const [suspiciousValue, setSuspiciousValue] = useState(42);

  const hoverTimer = useRef<number | null>(null);
  const [lateHoverOn, setLateHoverOn] = useState(false);

  const [fakeProgress, setFakeProgress] = useState(63);
  const [hasScrolled, setHasScrolled] = useState(false);

  const [mindText, setMindText] = useState("this will stay the same");

  useEffect(() => {
    const onScroll = () => {
      setHasScrolled(true);
      const y = window.scrollY || 0;
      // 63/64 “almost” wobble
      setFakeProgress(y % 2 === 0 ? 63 : 64);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (hasScrolled) return;
    const t = window.setTimeout(() => {
      // Only flips if they didn't scroll (secret little rule)
      setMindText("actually, never mind");
    }, 3000);
    return () => window.clearTimeout(t);
  }, [hasScrolled]);

  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-[#0f0f10] dark:text-neutral-100">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="group inline-flex items-center gap-3 odd-interactive">
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
              <Image src="/logo.png" data-odd-thumb alt="odd fun" fill className="object-contain p-1" priority />
            </div>
            <div className="leading-tight">
              <div className="text-lg font-semibold tracking-tight dark:text-neutral-100">odd fun</div>
              <div data-odd-shift className="text-xs text-neutral-500 dark:text-neutral-400">
                a place for odd little experiments
              </div>
            </div>
          </Link>

          {/* Theme toggle is rendered globally in layout.tsx */}
          <div className="text-xs text-neutral-400 dark:text-neutral-500">{/* spacer */}</div>
        </header>

        {/* Micro manifesto */}
        <section className="mt-8 max-w-2xl">
          <div className="text-sm text-neutral-700 dark:text-neutral-300">
            small interactive ideas to think with.
          </div>
          <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            no accounts. no feeds. just experiments.
          </div>
        </section>

        {/* Featured */}
        {featured?.href && (
          <section className="mt-8">
            <div className="text-[11px] uppercase tracking-[0.22em] text-neutral-400 dark:text-neutral-500">
              Featured
            </div>
            <Link
              href={featured.href}
              className={[
                "odd-interactive mt-3 block overflow-hidden rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition",
                "hover:shadow-md dark:border-white/10 dark:bg-white/5",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold tracking-tight">{featured.title}</div>
                  <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{featured.subtitle}</div>
                </div>
                {featured.badge && (
                  <span className="rounded-full border border-black/10 px-2 py-1 text-[11px] text-neutral-600 dark:border-white/10 dark:text-neutral-300">
                    {featured.badge}
                  </span>
                )}
              </div>
            </Link>
          </section>
        )}

        {/* Experiments grid */}
        <section
          className={[
            "mt-10 grid gap-6 sm:grid-cols-2",
            showGrid ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
            "transition-[opacity,transform] duration-500 ease-out",
          ].join(" ")}
          aria-label="experiments"
        >
          {experiments.map((exp, i) => {
            const CardInner = (
              <div
                className={[
                  "group relative w-full overflow-hidden rounded-2xl border bg-white shadow-sm",
                  exp.disabled
                    ? "cursor-default border-black/10 dark:border-white/10 dark:bg-white/5"
                    : "border-black/10 hover:shadow-md dark:border-white/10 dark:bg-white/5",
                ].join(" ")}
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={exp.imageSrc}
                    data-odd-thumb
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className={["object-cover", exp.disabled ? "odd-thumb-muted" : "odd-thumb"].join(" ")}
                    priority={i === 0}
                  />
                  {!exp.disabled && <div className="odd-thumb-overlay" />}
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-medium tracking-tight">{exp.title}</h2>
                    {exp.badge && (
                      <span className="rounded-full border border-black/10 bg-white/70 px-2 py-1 text-[10px] font-semibold tracking-[0.18em] text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200">
                        {exp.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{exp.subtitle}</p>
                </div>
              </div>
            );

            if (exp.disabled || !exp.href) return <div key={i}>{CardInner}</div>;

            return (
              <Link key={i} href={exp.href} className="block odd-interactive">
                {CardInner}
              </Link>
            );
          })}
        </section>

        {/* Odd interactions (not games) */}
        <section className="mt-14 rounded-2xl border border-black/10 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-neutral-800 dark:text-neutral-200">odd interactions</h3>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">nothing here is important.</p>
            </div>
            <div className="text-[11px] text-neutral-400 dark:text-neutral-500">(try clicking)</div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* #1 This Button Does Nothing */}
            <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/20">
              <button
                type="button"
                onClick={bumpNothing}
                className={[
                  "odd-nothing-btn w-full rounded-xl border px-4 py-3 text-sm font-medium",
                  "border-black/10 bg-white text-neutral-900 hover:shadow-sm active:translate-y-[1px]",
                  "dark:border-white/5 dark:bg-white/5 dark:text-neutral-100",
                ].join(" ")}
              >
                this button does nothing
              </button>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                pressed{" "}
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{formatNumber(nothingCount)}</span>{" "}
                times
              </p>
            </div>

            {/* #2 Useless checkbox */}
            <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/20">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={uselessChecked}
                  onChange={(e) => {
                    setUselessChecked(e.target.checked);
                    setShowUselessNote(true);
                    if (uselessNoteTimer.current) window.clearTimeout(uselessNoteTimer.current);
                    uselessNoteTimer.current = window.setTimeout(() => setShowUselessNote(false), 1400);
                  }}
                  className="h-4 w-4 rounded border-black/20 text-neutral-900 dark:border-white/20"
                />
                <span className="text-neutral-800 dark:text-neutral-200">enable something</span>
              </label>
              {showUselessNote && <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">nothing was enabled</p>}
            </div>

            {/* #3 Hover that reacts late */}
            <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/20">
              <div
                onMouseEnter={() => {
                  if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
                  hoverTimer.current = window.setTimeout(() => setLateHoverOn(true), 600);
                }}
                onMouseLeave={() => {
                  if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
                  hoverTimer.current = null;
                  setLateHoverOn(false);
                }}
                className={[
                  "inline-block select-none rounded-lg px-2 py-1 text-sm transition-[opacity] duration-200",
                  lateHoverOn ? "opacity-60" : "opacity-100",
                  "text-neutral-800 dark:text-neutral-200",
                ].join(" ")}
              >
                hover me
              </div>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">it reacts a little late.</p>
            </div>

            {/* #4 Fake progress */}
            <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/20">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span>almost there</span>
                <span>{fakeProgress}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-black/20 dark:bg-white/20 transition-[width] duration-300"
                  style={{ width: `${fakeProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">it will never be 100%.</p>
            </div>

            {/* #6 Do not click */}
            <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/20">
              <button
                type="button"
                onClick={() => {
                  setDontClickLabel("ok.");
                  setDontClickNote("that was it.");
                  window.setTimeout(() => {
                    setDontClickLabel("do not click");
                    setDontClickNote("seriously.");
                  }, 1200);
                }}
                className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-black/10 active:translate-y-[1px] dark:border-white/10 dark:bg-white/5 dark:text-neutral-100 dark:hover:bg-white/10"
              >
                {dontClickLabel}
              </button>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{dontClickNote}</p>
            </div>

            {/* #7 Suspicious slider */}
            <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/20">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">confidence</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">{suspiciousValue}%</p>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={suspiciousValue}
                onChange={(e) => setSuspiciousValue(Number(e.target.value))}
                className="mt-3 w-full accent-black/70 dark:accent-white/70"
              />
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">it doesn’t affect anything.</p>
            </div>

            {/* #5 Text that changes its mind */}
            <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/20">
              <p className="text-sm text-neutral-800 dark:text-neutral-200">{mindText}</p>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">it only changes if you don’t scroll.</p>
            </div>
          </div>
        </section>

        {/* Why + Donate row (INSIDE component) */}
        <div className="mt-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/about" className="odd-interactive text-sm opacity-60 hover:opacity-100 transition">
              about
            </Link>
            <Link href="/why" className="odd-interactive text-sm opacity-60 hover:opacity-100 transition">
              why
            </Link>
            <Link href="/donate" className="odd-interactive text-sm opacity-60 hover:opacity-100 transition">
              donate
            </Link>
          </div>
          <div className="w-[260px] sm:w-[320px]">
            <DonateCrypto compact />
          </div>
        </div>

        <footer className="mt-16 text-center text-xs text-neutral-400 dark:text-neutral-500">
          <span className="dark:hidden">odd fun is not here to help you</span>
          <span className="hidden dark:inline">odd fun is watching</span>
        </footer>
      </div>
    </main>
  );
}
