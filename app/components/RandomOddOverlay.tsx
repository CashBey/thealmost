'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type OddVariant =
  | { kind: 'whisper'; lines: string[]; delayMs: number }
  | { kind: 'dot'; delayMs: number }
  | { kind: 'lateHover'; delayMs: number };

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function RandomOddOverlay() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<OddVariant | null>(null);
  const [whisper, setWhisper] = useState<string | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);

  const variants = useMemo<OddVariant[]>(
    () => [
      { kind: 'whisper', lines: ['you are here', 'still.'], delayMs: 2200 },
      { kind: 'whisper', lines: ['this site is not trying to help you.'], delayMs: 2800 },
      { kind: 'whisper', lines: ['keep going.'], delayMs: 3200 },
      { kind: 'dot', delayMs: 1600 },
      { kind: 'lateHover', delayMs: 2400 },
    ],
    []
  );

  useEffect(() => {
    setMounted(true);
    // stable per tab session
    const key = 'odd-fun-odd-variant';
    const saved = typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as OddVariant;
        setActive(parsed);
        return;
      } catch {
        // ignore
      }
    }
    const chosen = pickOne(variants);
    setActive(chosen);
    try {
      window.sessionStorage.setItem(key, JSON.stringify(chosen));
    } catch {
      // ignore
    }
  }, [variants]);

  // whisper text
  useEffect(() => {
    if (!mounted || !active || active.kind !== 'whisper') return;
    const t = window.setTimeout(() => {
      // pick one line each page load but stable per session variant
      setWhisper(pickOne(active.lines));
    }, active.delayMs);
    return () => window.clearTimeout(t);
  }, [mounted, active]);

  // slow dot follows cursor (very subtle)
  useEffect(() => {
    if (!mounted || !active || active.kind !== 'dot') return;

    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    window.addEventListener('mousemove', onMove);

    const step = () => {
      const dx = target.current.x - pos.current.x;
      const dy = target.current.y - pos.current.y;
      pos.current.x += dx * 0.04;
      pos.current.y += dy * 0.04;
      const el = dotRef.current;
      if (el) {
        el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      raf.current = window.requestAnimationFrame(step);
    };

    const start = window.setTimeout(() => {
      raf.current = window.requestAnimationFrame(step);
    }, active.delayMs);

    return () => {
      window.clearTimeout(start);
      window.removeEventListener('mousemove', onMove);
      if (raf.current) window.cancelAnimationFrame(raf.current);
    };
  }, [mounted, active]);

  // late hover hint: only appears after user hovers the logo area
  const [lateHoverArmed, setLateHoverArmed] = useState(false);
  useEffect(() => {
    if (!mounted || !active || active.kind !== 'lateHover') return;
    const t = window.setTimeout(() => setLateHoverArmed(true), active.delayMs);
    return () => window.clearTimeout(t);
  }, [mounted, active]);

  if (!mounted || !active) return null;

  return (
    <>
      {active.kind === 'whisper' && whisper && (
        <div className="pointer-events-none fixed bottom-4 left-4 z-50 text-[12px] opacity-55 dark:opacity-50">
          {whisper}
        </div>
      )}

      {active.kind === 'dot' && (
        <div
          ref={dotRef}
          className="pointer-events-none fixed left-0 top-0 z-50 h-1 w-1 rounded-full opacity-35 blur-[0.2px] dark:opacity-30"
        />
      )}

      {active.kind === 'lateHover' && lateHoverArmed && (
        <div
          className="pointer-events-none fixed top-4 left-1/2 z-50 -translate-x-1/2 text-[12px] opacity-50 dark:opacity-45"
          aria-hidden
        >
          (you can leave anytime)
        </div>
      )}
    </>
  );
}
