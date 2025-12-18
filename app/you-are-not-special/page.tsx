'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, RefreshCw, Share2 } from 'lucide-react';
import WhatNext from '../components/WhatNext';

type Choice = { id: string; label: string; weight?: number };
type Question = {
  id: string;
  title: string;
  subtitle?: string;
  choices: Choice[];
  // Small UI suggestion (subtle): which option gets the tiniest emphasis.
  nudgeId?: string;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function formatNumber(n: number) {
  try {
    return new Intl.NumberFormat('en-US').format(n);
  } catch {
    return String(n);
  }
}

function isDark() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

function getStableBucket(key: string) {
  if (typeof window === 'undefined') return 0;
  const k = `odd-fun:${key}`;
  const existing = window.localStorage.getItem(k);
  if (existing === '0' || existing === '1') return Number(existing);
  const v = Math.random() < 0.5 ? 0 : 1;
  window.localStorage.setItem(k, String(v));
  return v;
}

function useCountUp(target: number, ms = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Math.round(target);

    const tick = (t: number) => {
      const p = clamp((t - start) / ms, 0, 1);
      // Ease-out
      const eased = 1 - Math.pow(1 - p, 3);
      const next = Math.round(from + (to - from) * eased);
      setValue(next);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, ms]);

  return value;
}

function drawShareImage(opts: {
  title: string;
  uniquenessPct: number;
  similarCount: number;
  variantLine: string;
  dark: boolean;
}) {
  const w = 1200;
  const h = 630;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background
  ctx.fillStyle = opts.dark ? '#0f0f10' : '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // Soft vignette
  const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 100, w * 0.5, h * 0.45, 800);
  grad.addColorStop(0, opts.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Text
  ctx.fillStyle = opts.dark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)';
  ctx.font = '600 64px Inter, system-ui, -apple-system, Segoe UI, Arial';
  ctx.fillText(opts.title, 80, 170);

  ctx.font = '500 36px Inter, system-ui, -apple-system, Segoe UI, Arial';
  ctx.fillStyle = opts.dark ? 'rgba(255,255,255,0.78)' : 'rgba(0,0,0,0.72)';
  ctx.fillText(`Uniqueness: ${opts.uniquenessPct}%`, 80, 250);
  ctx.fillText(`Similar profiles today: ${formatNumber(opts.similarCount)}`, 80, 305);

  ctx.font = '400 28px Inter, system-ui, -apple-system, Segoe UI, Arial';
  ctx.fillStyle = opts.dark ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.55)';
  ctx.fillText(opts.variantLine, 80, 380);

  // Footer
  ctx.font = '600 24px Inter, system-ui, -apple-system, Segoe UI, Arial';
  ctx.fillStyle = opts.dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';
  ctx.fillText('odd fun', 80, 560);

  return canvas;
}

export default function YouAreNotSpecialPage() {
  const questions: Question[] = useMemo(
    () => [
      {
        id: 'age',
        title: 'How old are you?',
        choices: [
          { id: 'u18', label: 'Under 18', weight: 2 },
          { id: '18_24', label: '18–24', weight: 1 },
          { id: '25_34', label: '25–34', weight: 1 },
          { id: '35_44', label: '35–44', weight: 1 },
          { id: '45p', label: '45+', weight: 2 },
        ],
      },
      {
        id: 'region',
        title: 'Where do you live?',
        choices: [
          { id: 'eu', label: 'Europe', weight: 1 },
          { id: 'na', label: 'North America', weight: 1 },
          { id: 'asia', label: 'Asia', weight: 1 },
          { id: 'sa', label: 'South America', weight: 2 },
          { id: 'other', label: 'Other', weight: 2 },
        ],
      },
      {
        id: 'internet',
        title: 'How often do you use the internet?',
        choices: [
          { id: 'const', label: 'Almost constantly', weight: 1 },
          { id: 'often', label: 'Often', weight: 1 },
          { id: 'sometimes', label: 'Sometimes', weight: 2 },
          { id: 'rarely', label: 'Rarely', weight: 3 },
        ],
        nudgeId: 'const',
      },
      {
        id: 'music',
        title: 'What kind of music do you enjoy?',
        choices: [
          { id: 'pop', label: 'Pop', weight: 1 },
          { id: 'hiphop', label: 'Hip-hop', weight: 1 },
          { id: 'rock', label: 'Rock', weight: 1 },
          { id: 'electronic', label: 'Electronic', weight: 1 },
          { id: 'other', label: 'Other', weight: 2 },
        ],
      },
      {
        id: 'different',
        title: 'Do you think you are different from most people?',
        choices: [
          { id: 'yes', label: 'Yes', weight: 0 },
          { id: 'no', label: 'No', weight: 2 },
          { id: 'unsure', label: "I'm not sure", weight: 1 },
        ],
        nudgeId: 'yes',
      },
      {
        id: 'value',
        title: 'Pick one that matters most to you.',
        choices: [
          { id: 'freedom', label: 'Freedom', weight: 1 },
          { id: 'comfort', label: 'Comfort', weight: 1 },
          { id: 'success', label: 'Success', weight: 1 },
          { id: 'happiness', label: 'Happiness', weight: 1 },
        ],
      },
      {
        id: 'unique',
        title: 'Do you consider yourself unique?',
        subtitle: 'Be honest.',
        choices: [
          { id: 'def', label: 'Definitely', weight: 0 },
          { id: 'maybe', label: 'Maybe', weight: 1 },
          { id: 'not', label: 'Not really', weight: 2 },
        ],
      },
    ],
    []
  );

  const totalQuestions = questions.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [progress, setProgress] = useState(12);
  // 0 none, 1 headline, 2 similarity line, 3 today-count+metrics, 4 final line
  const [revealStage, setRevealStage] = useState(0);

  const ab = useMemo(() => getStableBucket('ab:not-special'), []);
  const [copied, setCopied] = useState(false);

  // Progress: looks confident, but slightly wrong.
  useEffect(() => {
    const base = Math.round(((step + 1) / (totalQuestions + 1)) * 100);
    const wobble = step >= 3 ? (step % 2 === 0 ? 1 : -1) : 0;
    const clamped = step >= 3 ? clamp(base + wobble, 78, 92) : clamp(base, 10, 78);
    setProgress(clamped);
  }, [step, totalQuestions]);

  // Small delay after selecting (feels like “processing”).
  const nextTimer = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (nextTimer.current) window.clearTimeout(nextTimer.current);
    };
  }, []);

  const current = questions[step];
  const isDone = step >= totalQuestions;

  const result = useMemo(() => {
    // Compute an “uniqueness” score that almost always lands low.
    let w = 0;
    for (const q of questions) {
      const a = answers[q.id];
      const choice = q.choices.find((c) => c.id === a);
      w += choice?.weight ?? 1;
    }

    // Convert to a small percentage.
    // More “rare” answers (higher weight) increases uniqueness a little, but it stays low.
    const raw = 2 + Math.round((w / (totalQuestions * 2.2)) * 10); // ~2..12
    const uniquenessPct = clamp(raw, 2, 12);
    const similarityPct = 100 - uniquenessPct;

    // Similar profiles today: stable-ish, slightly alive.
    const base = 70000 + (12 - uniquenessPct) * 2500; // higher similarity -> bigger crowd
    const drift = typeof window !== 'undefined' ? Math.floor((Date.now() / (1000 * 60 * 60)) % 200) : 0;
    const similarCount = base + drift * (ab === 0 ? 3 : 2);

    const variantLineLight = ab === 0
      ? 'Most of them also thought they were unique.'
      : 'The good news? You blend in perfectly.';

    const variantLineDark = ab === 0
      ? 'That doesn’t make you rare.'
      : 'You look exactly like someone online.';

    return {
      uniquenessPct,
      similarityPct,
      similarCount,
      variantLineLight,
      variantLineDark,
    };
  }, [answers, questions, totalQuestions, ab]);

  const countUpSimilarity = useCountUp(result.similarityPct, 900);
  const countUpUnique = useCountUp(result.uniquenessPct, 900);

  // Final reveal sequence
  useEffect(() => {
    if (!isDone) {
      setRevealStage(0);
      return;
    }
    let t1: number | null = null;
    let t2: number | null = null;
    let t3: number | null = null;
    let t4: number | null = null;

    setRevealStage(1);
    t1 = window.setTimeout(() => setRevealStage(2), 900);
    t2 = window.setTimeout(() => setRevealStage(3), 1700);
    t3 = window.setTimeout(() => setRevealStage(4), 2500);

    return () => {
      if (t1) window.clearTimeout(t1);
      if (t2) window.clearTimeout(t2);
      if (t3) window.clearTimeout(t3);
      if (t4) window.clearTimeout(t4);
    };
  }, [isDone]);

  const onPick = (id: string) => {
    setSelected(id);
    setAnswers((prev) => ({ ...prev, [current.id]: id }));

    if (nextTimer.current) window.clearTimeout(nextTimer.current);
    nextTimer.current = window.setTimeout(() => {
      setSelected(null);
      setStep((s) => s + 1);
    }, 150);
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setSelected(null);
    setCopied(false);
  };

  const shareText = () => {
    return `I just found out I'm not special.\nodd fun did this to me.`;
  };

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  const downloadPNG = () => {
    const line = isDark() ? result.variantLineDark : result.variantLineLight;
    const canvas = drawShareImage({
      title: 'You are not special.',
      uniquenessPct: result.uniquenessPct,
      similarCount: result.similarCount,
      variantLine: line,
      dark: isDark(),
    });
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'odd-fun-you-are-not-special.png';
    a.click();
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-[#0f0f10] dark:text-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="odd-interactive text-sm text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            ← experiments
          </Link>
          <div data-odd-shift className="text-xs text-neutral-400 dark:text-neutral-500">odd fun</div>
        </header>

        {!isDone ? (
          <section className="mt-10">
            <h1 className="text-2xl font-semibold tracking-tight">You Are Not Special</h1>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              A short experiment about uniqueness.
            </p>

            {/* Progress */}
            <div className="mt-8">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span>
                  Question {step + 1} / {totalQuestions}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-black/20 dark:bg-white/20 transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Card */}
            <div className="mt-8 rounded-2xl border border-black/10 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="text-sm text-neutral-500 dark:text-neutral-400">{current.title}</div>
              {current.subtitle && (
                <div className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">{current.subtitle}</div>
              )}

              <div className="mt-5 grid gap-3">
                {current.choices.map((c) => {
                  const nudged = current.nudgeId === c.id;
                  const chosen = selected === c.id;
                  // subtle: a tiny emphasis on the nudged option
                  const nudgeClass = nudged
                    ? 'ring-1 ring-black/10 dark:ring-white/10'
                    : 'ring-0';

                  // special: Question 3 has a hover nudge on the “Almost constantly” option.
                  const extraHover = current.id === 'internet' && c.id === 'const'
                    ? 'hover:scale-[1.01]'
                    : '';

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onPick(c.id)}
                      className={[
                        'odd-interactive w-full rounded-xl border px-4 py-3 text-left text-sm',
                        'border-black/10 bg-white text-neutral-900 hover:bg-black/5 active:translate-y-[1px]',
                        'dark:border-white/10 dark:bg-black/20 dark:text-neutral-100 dark:hover:bg-white/10',
                        'transition-[transform,background-color,box-shadow] duration-200',
                        nudgeClass,
                        extraHover,
                        chosen ? 'shadow-sm' : '',
                      ].join(' ')}
                    >
                      <span className={nudged ? 'tracking-[0.01em]' : ''}>{c.label}</span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-5 text-xs text-neutral-400 dark:text-neutral-500">
                (this is anonymous. it doesn’t matter.)
              </p>
            </div>
          </section>
        ) : (
          <section className="mt-10">
            <h1 className="text-3xl font-semibold tracking-tight">
              {revealStage === 0 ? '' : 'You are not special.'}
            </h1>

            <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              {/* line 2 */}
              {revealStage >= 2 && (
                <p className="odd-reveal text-sm text-neutral-700 dark:text-neutral-200">
                  Based on your answers, you are statistically similar to{' '}
                  <span className="font-semibold">{countUpSimilarity}%</span> of people.
                </p>
              )}

              {/* line 3 */}
              {revealStage >= 3 && (
                <p className="odd-reveal mt-4 text-sm text-neutral-700 dark:text-neutral-200">
                  Today, <span className="font-semibold">{formatNumber(result.similarCount)}+</span> people answered almost exactly like you.
                </p>
              )}

              {/* metrics */}
              {revealStage >= 3 && (
                <div className="odd-reveal mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/20">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">uniqueness</div>
                    <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{countUpUnique}%</div>
                  </div>
                  <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/20">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">deviation</div>
                    <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">-0.2σ</div>
                  </div>
                  <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/20">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">status</div>
                    <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">average</div>
                  </div>
                </div>
              )}

              {/* line 4 */}
              {revealStage >= 4 && (
                <p className="odd-reveal mt-6 text-sm text-neutral-500 dark:text-neutral-400">
                  {isDark() ? result.variantLineDark : result.variantLineLight}
                </p>
              )}
            </div>

            
              {/* comparison visual */}
              {revealStage >= 3 && (
                <div className="odd-reveal mt-6 rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-black/20">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">comparison</div>
                  <div className="mt-4 flex items-end gap-3">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const base = 44 + (i % 3) * 2;
                      const isYou = i === 4;
                      const h = isYou ? base + 6 : base + (i === 0 ? 1 : 0);
                      return (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div
                            className={
                              'w-10 rounded-xl border border-black/10 bg-black/5 shadow-sm dark:border-white/10 dark:bg-white/10 ' +
                              (isYou ? 'opacity-95' : 'opacity-75')
                            }
                            style={{ height: `${h}px` }}
                          />
                          <div className="text-[11px] opacity-55">{isYou ? 'you' : ''}</div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                    your bar is almost identical to the others.
                  </p>
                </div>
              )}

              {/* soft landing */}
              {revealStage >= 4 && (
                <p className="odd-reveal mt-5 text-sm text-neutral-600 dark:text-neutral-300">
                  That doesn’t make you unimportant.
                </p>
              )
              }

              {/* actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="odd-interactive inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-neutral-900 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-neutral-100 dark:hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                try again
              </button>

              <button
                type="button"
                onClick={doCopy}
                className="odd-interactive inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-neutral-900 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-neutral-100 dark:hover:bg-white/10"
              >
                <Share2 className="h-4 w-4" />
                {copied ? 'copied' : 'copy share text'}
              </button>

              <button
                type="button"
                onClick={downloadPNG}
                className="odd-interactive inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-neutral-900 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-neutral-100 dark:hover:bg-white/10"
              >
                <Download className="h-4 w-4" />
                download PNG
              </button>
            </div>

            <WhatNext currentHref="/you-are-not-special" />

            <p className="mt-6 text-xs text-neutral-400 dark:text-neutral-500">
              this is a toy statistic. it’s still accurate enough.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
