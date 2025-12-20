'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import WhatNext from '../components/WhatNext';

type Phase = 'intro' | 'spending' | 'end';

type Item = {
  id: string;
  name: string;
  costBTC: number | '∞';
  note?: string;
};

const SATOSHI_BTC_ESTIMATE = 1_100_000;

const ITEMS: Item[] = [
  { id: 'coffee', name: 'A coffee', costBTC: 0.0001 },
  { id: 'dinner', name: 'A dinner for two', costBTC: 0.0012 },
  { id: 'laptop', name: 'A laptop', costBTC: 0.06 },
  { id: 'car', name: 'A car', costBTC: 2.5 },
  { id: 'house', name: 'A house', costBTC: 12 },
  { id: 'island', name: 'A private island', costBTC: 1200 },
  { id: 'startup', name: 'A startup', costBTC: 3500 },
  { id: 'stadium', name: 'A stadium', costBTC: 18000 },
  { id: 'media', name: 'A social media company', costBTC: 90000 },

  // odd items
  { id: 'secure', name: 'Feeling secure', costBTC: 0, note: 'Not a purchase.' },
  { id: 'remembered', name: 'Being remembered', costBTC: '∞', note: 'Unavailable.' },
];

const MICRO_LINES = [
  'This changes nothing.',
  'Still not yours.',
  'You can keep going.',
  'No one notices.',
  'It doesn\'t get lighter.',
  'Numbers don\'t carry meaning by themselves.',
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatBTC(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (abs >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export default function SpendSatoshiPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [readyToSpend, setReadyToSpend] = useState(false);

  const [remainingBTC, setRemainingBTC] = useState<number>(SATOSHI_BTC_ESTIMATE);
  const [spentBTC, setSpentBTC] = useState<number>(0);

  const [microLine, setMicroLine] = useState<string>(MICRO_LINES[0]);
  const [toast, setToast] = useState<string | null>(null);

  const introTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const nearEmpty = remainingBTC <= 0.02;

  useEffect(() => {
    introTimerRef.current = window.setTimeout(() => setReadyToSpend(true), 650);

    const lineInterval = window.setInterval(() => {
      setMicroLine((prev) => {
        const next = MICRO_LINES[Math.floor(Math.random() * MICRO_LINES.length)];
        return next === prev ? MICRO_LINES[(MICRO_LINES.indexOf(prev) + 1) % MICRO_LINES.length] : next;
      });
    }, 1700 + Math.floor(Math.random() * 900));

    return () => {
      if (introTimerRef.current) window.clearTimeout(introTimerRef.current);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      window.clearInterval(lineInterval);
    };
  }, []);

  useEffect(() => {
    if (phase === 'spending' && nearEmpty) {
      const t = window.setTimeout(() => setPhase('end'), 300);
      return () => window.clearTimeout(t);
    }
  }, [phase, nearEmpty]);

  function showToast(message: string) {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1200);
  }

  function attemptBuy(item: Item) {
  if (phase !== 'spending') return;

  if (item.costBTC === '∞') {
    showToast('Unavailable.');
    return;
  }

  if (item.costBTC === 0) {
    showToast('No transaction.');
    return;
  }

  if (remainingBTC <= 0) {
    showToast('Nothing left.');
    return;
  }

  const cost = item.costBTC; // burada artık kesin number

  if (cost > remainingBTC) {
    showToast('Not enough.');
    return;
  }

  setRemainingBTC((r) => clamp(r - cost, 0, SATOSHI_BTC_ESTIMATE));
  setSpentBTC((s) => clamp(s + cost, 0, SATOSHI_BTC_ESTIMATE));
}


  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#0f0f10] dark:text-white">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="odd-interactive text-sm opacity-70 hover:opacity-100 transition">
            odd fun
          </Link>
          <div data-odd-shift className="text-[12px] opacity-55">experiment</div>
        </div>

        {phase === 'intro' && (
          <div className="mt-14">
            <div className="text-sm opacity-70">This amount exists.</div>

            <div className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
              ≈ {SATOSHI_BTC_ESTIMATE.toLocaleString()} BTC
            </div>

            <div className="mt-4 text-sm opacity-60">Estimated holdings attributed to Satoshi Nakamoto.</div>

            <div className="mt-10">
              <button
                type="button"
                onClick={() => {
                  if (!readyToSpend) return;
                  window.setTimeout(() => setPhase('spending'), 150);
                }}
                disabled={!readyToSpend}
                className={[
                  'odd-interactive rounded-2xl px-5 py-3 text-sm font-medium',
                  'border border-black/10 dark:border-white/10',
                  'bg-black text-white dark:bg-white dark:text-black',
                  'shadow-sm transition',
                  readyToSpend ? 'hover:scale-[1.01] active:scale-[0.99]' : 'opacity-40 cursor-not-allowed',
                ].join(' ')}
              >
                Try spending it.
              </button>
            </div>
          </div>
        )}

        {phase === 'spending' && (
          <div className="mt-10">
            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="text-xs uppercase tracking-widest opacity-60">Remaining</div>
                <div className="mt-1 text-2xl font-semibold">{formatBTC(remainingBTC)} BTC</div>
              </div>

              <div className="text-right">
                <div className="text-xs uppercase tracking-widest opacity-60">Spent</div>
                <div className="mt-1 text-sm opacity-80">{formatBTC(spentBTC)} BTC</div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ITEMS.map((item) => {
                const disabled =
                  item.costBTC === '∞'
                    ? true
                    : typeof item.costBTC === 'number'
                      ? item.costBTC > remainingBTC
                      : true;

                const costLabel =
                  item.costBTC === '∞' ? '∞' : item.costBTC === 0 ? '0' : formatBTC(item.costBTC);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => attemptBuy(item)}
                    className={[
                      'odd-interactive text-left rounded-2xl p-4',
                      'border border-black/10 dark:border-white/10',
                      'bg-white/60 dark:bg-white/5',
                      'shadow-sm transition',
                      disabled ? 'opacity-40' : 'hover:scale-[1.01] active:scale-[0.99]',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm opacity-70 tabular-nums">{costLabel} BTC</div>
                    </div>
                    {item.note && <div className="mt-2 text-xs opacity-60">{item.note}</div>}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 text-sm opacity-60">{microLine}</div>

            {nearEmpty && (
              <div className="mt-8 rounded-2xl border border-black/10 dark:border-white/10 p-4">
                <div className="text-sm font-medium">You could afford everything here.</div>
                <div className="mt-2 text-xs opacity-60">And still stop here.</div>
              </div>
            )}

            {toast && (
              <div className="fixed left-1/2 top-6 -translate-x-1/2 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/50 px-4 py-2 text-xs shadow-sm backdrop-blur">
                {toast}
              </div>
            )}
          </div>
        )}

        {phase === 'end' && (
          <div className="mt-16">
            <div className="text-2xl sm:text-3xl font-semibold tracking-tight">You didn&apos;t feel richer.</div>

            <div className="mt-4 text-sm opacity-70">Because it was never yours.</div>

            <WhatNext currentHref="/spend-satoshi" />
          </div>
        )}

        <div className="mt-16 text-xs opacity-50">
          <span className="tabular-nums">≈</span> numbers change. the feeling usually doesn&apos;t.
        </div>
      </div>
    </div>
  );
}
