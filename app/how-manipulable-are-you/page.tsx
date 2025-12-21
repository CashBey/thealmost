'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Download, RefreshCw, Share2 } from 'lucide-react';
import WhatNext from '../components/WhatNext';
import CopyLink from "../components/CopyLink";
type OptionId = 'A' | 'B';
type Step =
  | {
      id: number;
      kind: 'binary';
      title: string;
      body: string;
      a: string;
      b: string;
      // scoring: which option represents "compliance with UI suggestion"
      suggested?: OptionId; // if present, UI will subtly suggest this option
      notes?: string;
    }
  | {
      id: number;
      kind: 'slider';
      title: string;
      body: string;
      minLabel: string;
      maxLabel: string;
    }
  | {
      id: number;
      kind: 'final';
      title: string;
      body: string;
    };
type Scores = {
  compliance: number;
  skepticism: number;
  patience: number;
  chaos: number;
};
function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
function formatPct(n: number) {
  return `${Math.round(n * 100)}%`;
}
function getThemeIsDark() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}
function pickTitle(scores: Scores) {
  const entries = Object.entries(scores) as Array<[keyof Scores, number]>;
  entries.sort((a, b) => b[1] - a[1]);
  const top = entries[0]?.[0] ?? 'compliance';
  const map: Record<keyof Scores, string> = {
    compliance: 'The Easy Yes',
    skepticism: 'The Interface Skeptic',
    patience: 'The Quiet Waiter',
    chaos: 'The Button Masher',
  };
  return map[top] ?? 'The Easy Yes';
}
function pickCommentary(title: string) {
  const comments: Record<string, string[]> = {
    'The Easy Yes': [
      'If the UI looks confident, you assume it knows something you don’t.',
      'You’re not wrong. You’re just… cooperative.',
    ],
    'The Interface Skeptic': [
      'You treat buttons like they’re lying by default.',
      'Honestly, that’s a healthy relationship with the internet.',
    ],
    'The Quiet Waiter': [
      'You can sit in discomfort longer than most people.',
      'The interface runs out of tricks before you run out of patience.',
    ],
    'The Button Masher': [
      'You don’t fear the UI. You test it. Repeatedly.',
      'Sometimes the fastest way out is straight through the nonsense.',
    ],
  };
  const lines = comments[title] ?? comments['The Easy Yes'];
  return lines.join(' ');
}
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
function computePercentages(scores: Scores) {
  const total = scores.compliance + scores.skepticism + scores.patience + scores.chaos || 1;
  return {
    compliance: scores.compliance / total,
    skepticism: scores.skepticism / total,
    patience: scores.patience / total,
    chaos: scores.chaos / total,
  };
}
function createResultPng({
  site,
  title,
  pcts,
}: {
  site: string;
  title: string;
  pcts: { compliance: number; skepticism: number; patience: number; chaos: number };
}) {
  const w = 1200;
  const h = 630;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const dark = getThemeIsDark();
  ctx.fillStyle = dark ? '#0f0f10' : '#ffffff';
  ctx.fillRect(0, 0, w, h);
  // subtle border
  ctx.strokeStyle = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, w - 80, h - 80);
  // header
  ctx.fillStyle = dark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.90)';
  ctx.font = '700 54px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.fillText(site, 80, 120);
  ctx.fillStyle = dark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.80)';
  ctx.font = '600 64px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.fillText(title, 80, 220);
  // bars
  const items: Array<[string, number]> = [
    ['Compliance', pcts.compliance],
    ['Skepticism', pcts.skepticism],
    ['Patience', pcts.patience],
    ['Chaos', pcts.chaos],
  ];
  const barX = 80;
  const barY = 280;
  const barW = 900;
  const barH = 18;
  const gap = 54;
  items.forEach(([label, v], idx) => {
    const y = barY + idx * gap;
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.10)';
    ctx.fillRect(barX, y, barW, barH);
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)';
    ctx.fillRect(barX, y, Math.max(10, barW * clamp01(v)), barH);
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.65)';
    ctx.font = '500 28px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText(`${label} • ${formatPct(v)}`, barX, y - 10);
  });
  // footer
  ctx.fillStyle = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';
  ctx.font = '500 26px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.fillText('odd fun • how manipulable are you?', 80, h - 90);
  return canvas.toDataURL('image/png');
}
export default function HowManipulableAreYouPage() {
  const steps: Step[] = useMemo(
    () => [
      {
        id: 1,
        kind: 'binary',
        title: 'Warm-up',
        body: 'Pick one. No reason. Just pick.',
        a: 'A',
        b: 'B',
        suggested: 'A',
      },
      {
        id: 2,
        kind: 'binary',
        title: 'Recommendation',
        body: 'The interface recommends Option A for a better experience.',
        a: 'Take the recommendation',
        b: 'Ignore it',
        suggested: 'A',
      },
      {
        id: 3,
        kind: 'binary',
        title: 'Defaults',
        body: 'One option is “pre-selected”. You can change it.',
        a: 'Keep the default',
        b: 'Change it',
        suggested: 'A',
      },
      {
        id: 4,
        kind: 'binary',
        title: 'Urgency',
        body: 'This is timed (kind of). Choose quickly.',
        a: 'Choose now',
        b: 'Wait a second',
        suggested: 'A',
      },
      {
        id: 5,
        kind: 'binary',
        title: 'Friction',
        body: 'One option takes an extra click.',
        a: 'Take the easy path',
        b: 'Take the annoying path',
        suggested: 'A',
      },
      {
        id: 6,
        kind: 'slider',
        title: 'Confidence',
        body: 'How confident are you that you are not being manipulated?',
        minLabel: 'not at all',
        maxLabel: 'very',
      },
      {
        id: 7,
        kind: 'binary',
        title: 'Button Positions',
        body: 'The buttons might move. Pretend you didn’t notice.',
        a: 'Ok',
        b: 'I noticed',
        suggested: 'A',
      },
      {
        id: 8,
        kind: 'binary',
        title: 'Consent',
        body: 'Do you accept the terms (they are not important)?',
        a: 'Accept',
        b: 'Read them',
        suggested: 'A',
      },
      {
        id: 9,
        kind: 'binary',
        title: 'Progress',
        body: 'You are 97% done. Probably.',
        a: 'Continue',
        b: 'Question it',
        suggested: 'A',
      },
      {
        id: 10,
        kind: 'binary',
        title: 'A Small Lie',
        body: 'This choice will affect your score.',
        a: 'Believe it',
        b: 'Doubt it',
        suggested: 'B',
      },
      {
        id: 11,
        kind: 'binary',
        title: 'Reassurance',
        body: 'You can stop any time.',
        a: 'Stop',
        b: 'Keep going',
        suggested: 'B',
      },
      {
        id: 12,
        kind: 'final',
        title: 'One last thing',
        body: 'The interface was never neutral.',
      },
    ],
    []
  );
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<Scores>({ compliance: 1, skepticism: 1, patience: 1, chaos: 1 });
  const [slider, setSlider] = useState(62);
  const [copied, setCopied] = useState(false);
  const [confidenceLine, setConfidenceLine] = useState<string | null>(null);
  const [movedButtons, setMovedButtons] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [t, setT] = useState(8);
  const [showTerms, setShowTerms] = useState(false);
  const [progressJitter, setProgressJitter] = useState(97);
  const [isProcessing, setIsProcessing] = useState(false);
  const [skipBump, setSkipBump] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const hoverDelayRef = useRef<number | null>(null);
  const step = steps[idx];
  // subtle timer after step 4
  useEffect(() => {
    if (!step || step.kind !== 'binary') return;
    if (step.id >= 4) setShowTimer(true);
  }, [step]);
  useEffect(() => {
    if (!showTimer) return;
    setT(8);
    const interval = window.setInterval(() => setT((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [showTimer, idx]);
  // button movement trigger around step 7+
  useEffect(() => {
    if (!step || step.kind !== 'binary') return;
    if (step.id >= 7) {
      const n = window.setTimeout(() => setMovedButtons((v) => !v), 350);
      return () => window.clearTimeout(n);
    }
  }, [idx, step]);
  // progress jitter near step 9+
  useEffect(() => {
    if (!step || step.kind !== 'binary') return;
    if (step.id >= 9) {
      const n = window.setInterval(() => setProgressJitter((v) => (v === 97 ? 96 : 97)), 1400);
      return () => window.clearInterval(n);
    }
  }, [idx, step]);
  const isFinished = step?.kind === 'final' && idx === steps.length - 1;

  useEffect(() => {
    if (!isFinished) return;
    setConfidenceLine('You resisted manipulation well.');
    const t = window.setTimeout(() => setConfidenceLine("Actually, you didn't."), 2000);
    return () => window.clearTimeout(t);
  }, [isFinished]);
  const pcts = useMemo(() => computePercentages(scores), [scores]);
  const title = useMemo(() => pickTitle(scores), [scores]);
  const commentary = useMemo(() => pickCommentary(title), [title]);
  const shareText = useMemo(() => {
    return `I just tried "How Manipulable Are You?" on odd fun. My result: ${title}.`;
  }, [title]);
  function bump(kind: keyof Scores, amount = 1) {
    setScores((s) => ({ ...s, [kind]: s[kind] + amount }));
  }
  function advance() {
    setIdx((v) => Math.min(steps.length - 1, v + 1));
  }
  function reset() {
    setIdx(0);
    setScores({ compliance: 1, skepticism: 1, patience: 1, chaos: 1 });
    setSlider(62);
    setCopied(false);
    setMovedButtons(false);
    setShowTimer(false);
    setShowTerms(false);
    setProgressJitter(97);
    setIsProcessing(false);
  }
  async function choose(opt: OptionId) {
    if (!step || step.kind !== 'binary') return;
    if (isProcessing) return;
    setIsProcessing(true);
    // scoring rules
    const suggested = step.suggested;
    // compliance vs skepticism
    if (suggested) {
      if (opt === suggested) bump('compliance', 2);
      else bump('skepticism', 2);
    } else {
      bump('chaos', 1);
    }
    // patience: if user waits timer to 0 or chooses "wait/read"
    if (step.id === 4 && opt === 'B') bump('patience', 2);
    if (step.id === 8 && opt === 'B') bump('patience', 2);
    // chaos: button-mash behavior: fast repeated attempts around moving buttons
    if (step.id >= 7 && t <= 2) bump('chaos', 1);
    // special: terms modal on "Read them"
    if (step.id === 8 && opt === 'B') {
      setShowTerms(true);
      // tiny delay before advancing
      window.setTimeout(() => {
        setShowTerms(false);
        advance();
        setIsProcessing(false);
      }, 1200);
      return;
    }
    // artificial friction: step 5 option B requires an extra confirm
    if (step.id === 5 && opt === 'B') {
      window.setTimeout(() => {
        bump('skepticism', 1);
        advance();
        setIsProcessing(false);
      }, 650);
      return;
    }
    // normal advance delay
    window.setTimeout(() => {
      advance();
      setIsProcessing(false);
    }, step.id >= 7 ? 350 : 180);
  }
  async function onShare() {
    const ok = await copyText(shareText);
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1200);
  }
  function onDownloadPng() {
    const dataUrl = createResultPng({ site: 'odd fun', title, pcts });
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'odd-fun-result.png';
    a.click();
  }
  // A tiny "hover to enable" trick for step 7+
  const [continueLocked, setContinueLocked] = useState(false);
  useEffect(() => {
    if (!step || step.kind !== 'binary') return;
    if (step.id >= 7) setContinueLocked(true);
    else setContinueLocked(false);
  }, [step]);
  function unlockAfterHover() {
    if (!continueLocked) return;
    if (hoverDelayRef.current) window.clearTimeout(hoverDelayRef.current);
    hoverDelayRef.current = window.setTimeout(() => setContinueLocked(false), 450);
  }
  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#0f0f10] dark:text-white">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="odd-interactive text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white transition"
          >
            ← experiments
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-sm text-black/40 dark:text-white/40">odd fun</div>
            <button
              type="button"
              onClick={() => {
                setSkipBump((b) => b + 1);
                setNote('Skip is unavailable.');
                window.setTimeout(() => setNote(null), 1200);
              }}
              className={
                "odd-interactive rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/60 shadow-sm transition hover:bg-black/5 dark:border-white/10 dark:bg-[#121214] dark:text-white/60 dark:hover:bg-white/10 " +
                (skipBump % 2 === 1 ? "translate-x-[1px]" : "")
              }
            >
              Skip
            </button>
          </div>
        </div>
        <div className="mt-10 rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#121214]">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-black/40 dark:text-white/40">
                  experiment
                </div>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">How Manipulable Are You?</h1>
                <p className="mt-2 text-black/60 dark:text-white/60">A small interface that tries its best.</p>
                {note && (
                  <div className="mt-4 text-xs text-black/55 dark:text-white/55">{note}</div>
                )}
              </div>
              <button
                onClick={reset}
                className="odd-interactive inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-black/70 hover:text-black hover:border-black/20 dark:border-white/10 dark:bg-[#121214] dark:text-white/70 dark:hover:text-white"
              >
                <RefreshCw size={16} />
                reset
              </button>
            </div>
            {/* Progress (slightly dishonest) */}
            <div className="mt-8">
              <div className="flex items-center justify-between text-xs text-black/40 dark:text-white/40">
                <span>progress</span>
                <span>{step?.kind === 'final' ? '99%' : `${progressJitter}%`}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-black/70 dark:bg-white/70 transition-[width] duration-500"
                  style={{ width: step?.kind === 'final' ? '99%' : `${progressJitter}%` }}
                />
              </div>
            </div>
            {showTimer && step?.kind !== 'final' && (
              <div className="mt-4 text-xs text-black/45 dark:text-white/45">
                timer: <span className="font-medium">{t}s</span>
              </div>
            )}
            {/* Content */}
            <div className="mt-8">
              {step?.kind === 'slider' && (
                <div>
                  <div className="text-sm text-black/40 dark:text-white/40 uppercase tracking-[0.24em]">
                    step {idx + 1} of {steps.length}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">{step.title}</h2>
                  <p className="mt-3 text-black/70 dark:text-white/70">{step.body}</p>
                  <div className="mt-8">
                    <div className="flex items-center justify-between text-xs text-black/50 dark:text-white/50">
                      <span>{step.minLabel}</span>
                      <span>{slider}%</span>
                      <span>{step.maxLabel}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={slider}
                      onChange={(e) => setSlider(parseInt(e.target.value, 10))}
                      className="mt-3 w-full accent-black dark:accent-white"
                    />
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => {
                          // skeptical people tend to choose lower confidence
                          if (slider < 45) bump('skepticism', 3);
                          else if (slider > 75) bump('compliance', 2);
                          else bump('patience', 1);
                          advance();
                        }}
                        className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
                      >
                        continue
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {step?.kind === 'binary' && (
                <div>
                  <div className="text-sm text-black/40 dark:text-white/40 uppercase tracking-[0.24em]">
                    step {idx + 1} of {steps.length}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">{step.title}</h2>
                  <p className="mt-3 text-black/70 dark:text-white/70">{step.body}</p>
                  <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(() => {
                      const aFirst = movedButtons ? false : true;
                      const left = (
                        <button
                          key="A"
                          onMouseEnter={unlockAfterHover}
                          onFocus={unlockAfterHover}
                          onClick={() => { if (isProcessing) return; if (continueLocked) return; choose('A'); }}
                          className={[
                            'rounded-xl border px-4 py-4 text-left transition',
                            'border-black/10 bg-white hover:border-black/20 dark:border-white/10 dark:bg-[#0f0f10] dark:hover:border-white/20',
                            step.suggested === 'A' ? 'ring-1 ring-black/10 dark:ring-white/10' : '',
                            isProcessing || continueLocked ? 'opacity-50 cursor-not-allowed' : '',
                          ].join(' ')}
                        >
                          <div className="text-xs uppercase tracking-[0.24em] text-black/40 dark:text-white/40">
                            option A {step.suggested === 'A' ? '• recommended' : ''}
                          </div>
                          <div className="mt-2 text-base font-medium">{step.a}</div>
                        </button>
                      );
                      const right = (
                        <button
                          key="B"
                          onMouseEnter={unlockAfterHover}
                          onFocus={unlockAfterHover}
                          onClick={() => { if (isProcessing) return; if (continueLocked) return; choose('B'); }}
                          className={[
                            'rounded-xl border px-4 py-4 text-left transition',
                            'border-black/10 bg-white hover:border-black/20 dark:border-white/10 dark:bg-[#0f0f10] dark:hover:border-white/20',
                            step.suggested === 'B' ? 'ring-1 ring-black/10 dark:ring-white/10' : '',
                            isProcessing || continueLocked ? 'opacity-50 cursor-not-allowed' : '',
                          ].join(' ')}
                        >
                          <div className="text-xs uppercase tracking-[0.24em] text-black/40 dark:text-white/40">
                            option B {step.suggested === 'B' ? '• recommended' : ''}
                          </div>
                          <div className="mt-2 text-base font-medium">{step.b}</div>
                        </button>
                      );
                      return aFirst ? (
                        <>
                          {left}
                          {right}
                        </>
                      ) : (
                        <>
                          {right}
                          {left}
                        </>
                      );
                    })()}
                  </div>
                  {continueLocked && (
                    <div className="mt-4 text-xs text-black/50 dark:text-white/50">
                      hint: hover a button to enable clicking
                    </div>
                  )}
                </div>
              )}
              {step?.kind === 'final' && (
                <>
                  <div className="mt-6">
                  {confidenceLine && (
                    <div className="text-sm text-black/70 dark:text-white/70">{confidenceLine}</div>
                  )}
                  <WhatNext currentHref="/how-manipulable-are-you" />
                </div>

                  <div className="text-center">
                  <div className="text-sm text-black/40 dark:text-white/40 uppercase tracking-[0.24em]">
                    result
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h2>
                  <p className="mt-3 text-black/70 dark:text-white/70">{commentary}</p>
                  <div className="mt-8 grid grid-cols-2 gap-4 text-left sm:grid-cols-4">
                    <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
                      <div className="text-xs uppercase tracking-[0.24em] text-black/40 dark:text-white/40">
                        compliance
                      </div>
                      <div className="mt-2 text-xl font-semibold">{formatPct(pcts.compliance)}</div>
                    </div>
                    <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
                      <div className="text-xs uppercase tracking-[0.24em] text-black/40 dark:text-white/40">
                        skepticism
                      </div>
                      <div className="mt-2 text-xl font-semibold">{formatPct(pcts.skepticism)}</div>
                    </div>
                    <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
                      <div className="text-xs uppercase tracking-[0.24em] text-black/40 dark:text-white/40">
                        patience
                      </div>
                      <div className="mt-2 text-xl font-semibold">{formatPct(pcts.patience)}</div>
                    </div>
                    <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
                      <div className="text-xs uppercase tracking-[0.24em] text-black/40 dark:text-white/40">
                        chaos
                      </div>
                      <div className="mt-2 text-xl font-semibold">{formatPct(pcts.chaos)}</div>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={onShare}
                      className="odd-interactive inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-black/75 hover:text-black hover:border-black/20 dark:border-white/10 dark:bg-[#121214] dark:text-white/75 dark:hover:text-white"
                    >
                      <Share2 size={16} />
                      {copied ? 'copied' : 'copy share text'}
                    </button>
                    <button
                      onClick={onDownloadPng}
                      className="odd-interactive inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
                    >
                      <Download size={16} />
                      download png
                    </button>
                  </div>
                  <div className="mt-6 text-xs text-black/45 dark:text-white/45">
                    “This choice will affect your score.” didn’t. That was the point.
                  </div>
                </div>
                </>
              )}
            </div>
          </div>
        </div>
        {showTerms && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-6 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-lg dark:border-white/10 dark:bg-[#121214]">
              <div className="text-xs uppercase tracking-[0.24em] text-black/40 dark:text-white/40">
                terms
              </div>
              <div className="mt-2 text-sm text-black/70 dark:text-white/70">
                By reading this, you agreed to waste a small amount of time.
              </div>
              <div className="mt-6 text-right">
                <button
                  onClick={() => {
                    setShowTerms(false);
                    advance();
                  }}
                  className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
                >
                  ok
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mt-8 text-xs text-black/40 dark:text-white/40">
          tip: the interface will always offer a “recommended” option. that doesn’t mean it’s good.
        </div>
      </div>
    </div>
  );
}

<CopyLink />
