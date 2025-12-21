'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, RefreshCw, Share2 } from 'lucide-react';
import WhatNext from '../components/WhatNext';
import CopyLink from "../components/CopyLink";

function formatNumber(n: number) {
  try {
    return new Intl.NumberFormat('en-US').format(n);
  } catch {
    return String(n);
  }
}

function makeShareText(seconds: number) {
  return `I waited ${seconds}s on The Waiting Game. It didn't matter.\nodd fun`;
}

function downloadPNG(title: string, subtitle: string, seconds: number) {
  const w = 1200;
  const h = 630;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isDark = document.documentElement.classList.contains('dark');
  ctx.fillStyle = isDark ? '#0f0f10' : '#ffffff';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.9)';
  ctx.font = '600 64px system-ui, -apple-system, Segoe UI, Inter, Arial';
  ctx.fillText(title, 72, 170);

  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.65)';
  ctx.font = '400 34px system-ui, -apple-system, Segoe UI, Inter, Arial';
  ctx.fillText(subtitle, 72, 240);

  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)';
  ctx.font = '500 40px system-ui, -apple-system, Segoe UI, Inter, Arial';
  ctx.fillText(`You waited: ${seconds}s`, 72, 360);

  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  ctx.font = '400 22px system-ui, -apple-system, Segoe UI, Inter, Arial';
  ctx.fillText('odd fun', 72, 520);

  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'odd-fun-waiting.png';
  a.click();
}

export default function WaitingGamePage() {
  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [fakeProgress, setFakeProgress] = useState(82);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const todayPlayed = useMemo(() => {
    // “global-ish” number (no backend) – stable per day per user
    const key = 'odd-fun-waiting-today';
    const day = new Date().toISOString().slice(0, 10);
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    if (saved) return Number(saved);
    const base = 4200 + Math.floor(Math.random() * 1200);
    try {
      window.localStorage.setItem(key, String(base));
      window.localStorage.setItem(key + '-d', day);
    } catch {}
    return base;
  }, []);

  useEffect(() => {
    if (!started || done) return;
    intervalRef.current = window.setInterval(() => {
      setSeconds((s) => s + 1);
      setFakeProgress((p) => {
        // never reaches 100
        const wobble = Math.random() < 0.55 ? 0 : (Math.random() < 0.5 ? 1 : -1);
        const next = Math.max(84, Math.min(97, p + wobble));
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [started, done]);

  useEffect(() => {
    if (!started || done) return;
    if (seconds === 8) setMessage('still waiting…');
    if (seconds === 18) setMessage('almost.');
    if (seconds === 28) setMessage('you can stop now.');
    if (seconds === 45) setMessage('it will never say 100%.');
    if (seconds === 60) setMessage('you are good at this.');
  }, [seconds, started, done]);

  const finish = () => {
    setDone(true);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
  };

  const reset = () => {
    setStarted(false);
    setSeconds(0);
    setFakeProgress(82);
    setDone(false);
    setMessage(null);
  };

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(makeShareText(seconds));
      setMessage('copied.');
      window.setTimeout(() => setMessage(null), 1200);
    } catch {
      setMessage('could not copy.');
      window.setTimeout(() => setMessage(null), 1200);
    }
  };

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="odd-interactive text-sm opacity-70 hover:opacity-100">
            ← experiments
          </Link>
          <div className="text-[12px] opacity-55">{formatNumber(todayPlayed)} played today</div>
        </div>

        {!started && (
          <div className="rounded-3xl border p-8 shadow-sm">
            <h1 className="text-3xl font-semibold">The Waiting Game</h1>
            <p className="mt-2 text-sm opacity-70">An experiment about patience. It won’t reward you.</p>
            <button
              onClick={() => setStarted(true)}
              className="odd-interactive mt-6 rounded-full border px-5 py-2 text-sm transition hover:opacity-100 opacity-90"
            >
              Start waiting
            </button>
          </div>
        )}

        {started && !done && (
          <div className="rounded-3xl border p-8 shadow-sm">
            <div className="text-sm opacity-70">Wait.</div>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-black/25 dark:bg-white/30 transition-all duration-300"
                style={{ width: `${fakeProgress}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="opacity-75">{fakeProgress}%</div>
              <div className="opacity-75">{seconds}s</div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={finish}
                className="odd-interactive rounded-full border px-4 py-2 text-sm opacity-90 transition hover:opacity-100"
              >
                Stop waiting
              </button>
              <button
                onClick={() => setMessage('there is no skip.')}
                className="odd-interactive rounded-full border px-4 py-2 text-sm opacity-80 transition hover:opacity-100"
              >
                Skip
              </button>
            </div>

            {message && <div className="mt-6 text-sm opacity-65">{message}</div>}
          </div>
        )}

        {done && (
          <div className="rounded-3xl border p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">You waited.</h2>
            <p className="mt-2 text-sm opacity-70">It didn’t matter.</p>

            <div className="mt-6 text-sm">
              <div className="opacity-80">Time spent: <span className="font-medium">{seconds}s</span></div>
              <div className="mt-2 opacity-60">Most people stop around {Math.max(7, Math.min(42, 12 + (seconds % 17)))}s.</div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={copyShare}
                className="odd-interactive inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm opacity-90 transition hover:opacity-100"
              >
                <Share2 className="h-4 w-4" />
                Copy share text
              </button>
              <button
                onClick={() => downloadPNG('The Waiting Game', 'It didn’t matter.', seconds)}
                className="odd-interactive inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm opacity-90 transition hover:opacity-100"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </button>
              <button
                onClick={reset}
                className="odd-interactive inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm opacity-85 transition hover:opacity-100"
              >
                <RefreshCw className="h-4 w-4" />
                Replay
              </button>
            </div>

            <WhatNext currentHref="/the-waiting-game" />
          </div>
        )}
      </div>
          <CopyLink />
    </main>
  );
}