'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Share2, RefreshCw, Download } from 'lucide-react';
import WhatNext from '../components/WhatNext';
import CopyLink from "../components/CopyLink";

type Choice = 'A' | 'B';

interface Question {
  id: number;
  text: string;
  optionA: string;
  optionB: string;
  traits: {
    A: { empathy?: number; utilitarianism?: number; ego?: number; chaos?: number };
    B: { empathy?: number; utilitarianism?: number; ego?: number; chaos?: number };
  };
}

const questions: Question[] = [
  {
    id: 1,
    text: "You find a wallet with $500 and an ID. No one is watching.",
    optionA: "Return it immediately",
    optionB: "Keep the cash, mail back the wallet",
    traits: {
      A: { empathy: 10, utilitarianism: 5 },
      B: { ego: 10, chaos: 5 }
    }
  },
  {
    id: 2,
    text: "A trolley is heading toward five people. You can divert it to kill one person instead.",
    optionA: "Pull the lever",
    optionB: "Do nothing",
    traits: {
      A: { utilitarianism: 15 },
      B: { empathy: 10, chaos: 5 }
    }
  },
  {
    id: 3,
    text: "Your best friend asks if they look good. They don't.",
    optionA: "Tell them the truth",
    optionB: "Lie to protect their feelings",
    traits: {
      A: { ego: 5, chaos: 5 },
      B: { empathy: 10, utilitarianism: 5 }
    }
  },
  {
    id: 4,
    text: "You can take credit for your colleague's idea and get promoted.",
    optionA: "Take the credit",
    optionB: "Give them credit",
    traits: {
      A: { ego: 15, chaos: 5 },
      B: { empathy: 15, utilitarianism: 5 }
    }
  },
  {
    id: 5,
    text: "You discover your company is polluting illegally. Exposing it means you lose your job.",
    optionA: "Stay silent",
    optionB: "Expose them",
    traits: {
      A: { ego: 10, utilitarianism: 5 },
      B: { empathy: 10, chaos: 10 }
    }
  },
  {
    id: 6,
    text: "You can live comfortably while 100 strangers suffer, or struggle while they thrive.",
    optionA: "Choose comfort",
    optionB: "Choose their wellbeing",
    traits: {
      A: { ego: 15 },
      B: { empathy: 15, utilitarianism: 10 }
    }
  },
  {
    id: 7,
    text: "A genie offers: know every truth about your life, or stay blissfully ignorant.",
    optionA: "Know everything",
    optionB: "Stay ignorant",
    traits: {
      A: { chaos: 10, ego: 5 },
      B: { utilitarianism: 10 }
    }
  },
  {
    id: 8,
    text: "You can save your pet or a stranger's child. Only one.",
    optionA: "Save your pet",
    optionB: "Save the child",
    traits: {
      A: { ego: 20 },
      B: { empathy: 15, utilitarianism: 15 }
    }
  },
  {
    id: 9,
    text: "You inherit $10 million, but accepting it means a random person goes bankrupt.",
    optionA: "Accept the money",
    optionB: "Refuse it",
    traits: {
      A: { ego: 10, utilitarianism: 5 },
      B: { empathy: 15 }
    }
  },
  {
    id: 10,
    text: "You can erase your most painful memory, but you'll forget the lesson it taught you.",
    optionA: "Erase it",
    optionB: "Keep the pain",
    traits: {
      A: { ego: 10 },
      B: { utilitarianism: 10, empathy: 5 }
    }
  },
  {
    id: 11,
    text: "You witness a crime. Testifying destroys the criminal's family, but brings justice.",
    optionA: "Testify",
    optionB: "Stay silent",
    traits: {
      A: { utilitarianism: 10, chaos: 5 },
      B: { empathy: 10 }
    }
  },
  {
    id: 12,
    text: "Everyone must follow your moral code, or everyone follows their own. Choose.",
    optionA: "Everyone follows mine",
    optionB: "Everyone follows their own",
    traits: {
      A: { ego: 15, utilitarianism: 10 },
      B: { chaos: 15, empathy: 5 }
    }
  },
  {
    id: 13,
    text: "You can prevent a tragedy, but you'll be blamed for it forever.",
    optionA: "Prevent it anyway",
    optionB: "Let it happen",
    traits: {
      A: { empathy: 15, utilitarianism: 10 },
      B: { ego: 15 }
    }
  },
  {
    id: 14,
    text: "A dying billionaire offers you their fortune to lie at their funeral about who they were.",
    optionA: "Take it and lie",
    optionB: "Refuse",
    traits: {
      A: { ego: 10, utilitarianism: 5 },
      B: { empathy: 10, chaos: 5 }
    }
  },
  {
    id: 15,
    text: "You can rewrite one decision in your past, but someone else suffers the consequence instead.",
    optionA: "Rewrite it",
    optionB: "Leave it unchanged",
    traits: {
      A: { ego: 20 },
      B: { empathy: 20 }
    }
  }
];

const personalityTypes = [
  {
    name: "The Ruthless Optimizer",
    criteria: { utilitarianism: 30, ego: 20 },
    description: "You calculate outcomes like a machine. Emotions are bugs in your system. You've convinced yourself this makes you rational, not cruel."
  },
  {
    name: "The Comfortable Egotist",
    criteria: { ego: 35 },
    description: "You've mastered the art of justifying self-interest. Your moral compass points directly at you. At least you're honest about it."
  },
  {
    name: "The Guilty Empath",
    criteria: { empathy: 35 },
    description: "You'd sacrifice yourself for strangers, then wonder why you feel empty. Your kindness borders on self-destruction. Martyrdom suits you."
  },
  {
    name: "The Chaos Philosopher",
    criteria: { chaos: 30 },
    description: "You choose the unpredictable because predictability terrifies you. Order feels like a cage. Your life is a controlled burn."
  },
  {
    name: "The Pragmatic Survivor",
    criteria: { ego: 25, utilitarianism: 25 },
    description: "You balance selfishness with logic. You help others when it's convenient. You sleep fine at night because you've lowered your expectations."
  },
  {
    name: "The Conflicted Idealist",
    criteria: { empathy: 25, chaos: 20 },
    description: "You want to do good but keep making exceptions. Your morality is a rough draft. You're still editing."
  }
];

export default function Home() {
  const [stage, setStage] = useState<'landing' | 'questions' | 'results'>('landing');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Choice[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isDelayed, setIsDelayed] = useState(false);
  // Used to temporarily block double-clicking while the "delay" manipulation is active.
  const [isProcessing, setIsProcessing] = useState(false);
  const [shuffleButtons, setShuffleButtons] = useState(false);
  const [traits, setTraits] = useState({ empathy: 0, utilitarianism: 0, ego: 0, chaos: 0 });
  const [personalityType, setPersonalityType] = useState('');
  const [mostQuestionable, setMostQuestionable] = useState(0);
  const [secretEnding, setSecretEnding] = useState(false);
  const [revealFromSecret, setRevealFromSecret] = useState(false);
  const [playStats, setPlayStats] = useState<{ total: number; typeCount: number; percent: number } | null>(null);

  const [showDifferentTeaser, setShowDifferentTeaser] = useState(false);
  const [showDifferentPanel, setShowDifferentPanel] = useState(false);
  const [alternateReveal, setAlternateReveal] = useState(false);
  const [alternate, setAlternate] = useState<null | { questionNumber: number; personalityType: string; traits: { empathy: number; utilitarianism: number; ego: number; chaos: number } }>(null);

  useEffect(() => {
    if (currentQuestion === 8 && stage === 'questions') {
      setShowTimer(true);
    }

    if (currentQuestion === 10 && stage === 'questions') {
      setIsDelayed(true);
    }

    if (currentQuestion >= 11 && stage === 'questions') {
      setShuffleButtons(Math.random() > 0.5);
    }
  }, [currentQuestion, stage]);

  useEffect(() => {
    if (showTimer && timeLeft > 0 && stage === 'questions') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showTimer, timeLeft, stage]);


  useEffect(() => {
    if (stage !== 'results') {
      setPlayStats(null);
      setShowDifferentTeaser(false);
      return;
    }

    setShowDifferentPanel(false);
    setAlternate(null);

    // Teaser appears a moment after the results land.
    const t = setTimeout(() => setShowDifferentTeaser(true), 3500);

    // Local “global-ish” stats (this browser only, no backend).
    try {
      if (personalityType) {
        const key = 'ce_stats_v1';
        const raw = localStorage.getItem(key);
        const parsed: { total: number; byType: Record<string, number> } = raw
          ? JSON.parse(raw)
          : { total: 0, byType: {} };

        const nextTotal = (parsed.total || 0) + 1;
        const nextByType = { ...(parsed.byType || {}) };
        nextByType[personalityType] = (nextByType[personalityType] || 0) + 1;

        localStorage.setItem(key, JSON.stringify({ total: nextTotal, byType: nextByType }));

        const typeCount = nextByType[personalityType];
        const percent = Math.max(1, Math.round((typeCount / nextTotal) * 100));
        setPlayStats({ total: nextTotal, typeCount, percent });
      }
    } catch {
      // ignore storage errors
    }

    return () => clearTimeout(t);
  }, [stage, personalityType]);


  useEffect(() => {
    if (!showDifferentPanel) {
      setAlternateReveal(false);
      return;
    }
    const t = setTimeout(() => setAlternateReveal(true), 900);
    return () => clearTimeout(t);
  }, [showDifferentPanel]);


  const startGame = () => {
    setStage('questions');
    setCurrentQuestion(0);
    setAnswers([]);
    setShowDifferentTeaser(false);
    setShowDifferentPanel(false);
    setAlternate(null);
    setAlternateReveal(false);
    setSecretEnding(false);
    setRevealFromSecret(false);
  };

  const handleAnswer = (choice: Choice) => {
    if (isDelayed) {
      // Don't permanently disable choices—only add a subtle delay and prevent spam clicks.
      if (isProcessing) return;
      setIsProcessing(true);
      setTimeout(() => {
        processAnswer(choice);
        setIsProcessing(false);
      }, 800);
      return;
    }

    processAnswer(choice);
  };

  const processAnswer = (choice: Choice) => {
    const newAnswers = [...answers, choice];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShuffleButtons(false);
    } else {
      calculateResults(newAnswers);
    }
  };


  const computeResults = (finalAnswers: Choice[]) => {
    const calculatedTraits = { empathy: 0, utilitarianism: 0, ego: 0, chaos: 0 };

    finalAnswers.forEach((answer, index) => {
      const question = questions[index];
      const traitChanges = question.traits[answer];

      Object.entries(traitChanges).forEach(([trait, value]) => {
        calculatedTraits[trait as keyof typeof calculatedTraits] += value;
      });
    });

    const total = Object.values(calculatedTraits).reduce((sum, val) => sum + val, 0) || 1;
    const normalizedTraits = {
      empathy: Math.round((calculatedTraits.empathy / total) * 100),
      utilitarianism: Math.round((calculatedTraits.utilitarianism / total) * 100),
      ego: Math.round((calculatedTraits.ego / total) * 100),
      chaos: Math.round((calculatedTraits.chaos / total) * 100)
    };

    let type = personalityTypes[personalityTypes.length - 1];
    for (const pt of personalityTypes) {
      let matches = true;
      for (const [trait, minValue] of Object.entries(pt.criteria)) {
        if (normalizedTraits[trait as keyof typeof normalizedTraits] < minValue) {
          matches = false;
          break;
        }
      }
      if (matches) {
        type = pt;
        break;
      }
    }

    
    const chaosHigh = normalizedTraits.chaos >= 42;
    const egoHigh = normalizedTraits.ego >= 34;
    const empathyLow = normalizedTraits.empathy <= 18;

    // A “secret ending” trigger: either a rare trait profile OR a specific choice pattern.
    const patternTrigger =
      finalAnswers[1] === 'B' && // Q2
      finalAnswers[4] === 'A' && // Q5
      finalAnswers[7] === 'B' && // Q8
      finalAnswers[10] === 'A';  // Q11

    const secret = (chaosHigh && egoHigh && empathyLow) || patternTrigger;
const questionableQuestions = [8, 4, 12, 15, 6];
    const mostQuestionableQ = questionableQuestions.find(q => finalAnswers[q - 1] === 'A') || 8;

    return { traits: normalizedTraits, personalityType: type.name, mostQuestionable: mostQuestionableQ, secretEnding: secret };
  };

  const calculateResults = (finalAnswers: Choice[]) => {
    const result = computeResults(finalAnswers);
    setTraits(result.traits);
    setPersonalityType(result.personalityType);
    setMostQuestionable(result.mostQuestionable);
    setSecretEnding(!!(result as any).secretEnding);
    setRevealFromSecret(false);
    setStage('results');
  };

  const goBack = () => {
    if (currentQuestion > 0 && currentQuestion <= 5) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const shareResult = () => {
    const text = `I just tested my morality on The Choice Engine. My result: ${personalityType}.`;
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadResultPng = () => {
    // 1200x630 (Open Graph friendly)
    const width = 1200;
    const height = 630;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Card
    const pad = 56;
    const cardX = pad;
    const cardY = pad;
    const cardW = width - pad * 2;
    const cardH = height - pad * 2;

    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    // Title
    ctx.fillStyle = '#9ca3af'; // gray-400-ish
    ctx.font = '600 22px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText('THE CHOICE ENGINE', cardX + 40, cardY + 56);

    // Personality
    ctx.fillStyle = '#fff';
    ctx.font = '800 52px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
    const name = (secretEnding ? 'YOU BROKE THE ENGINE' : personalityType || 'Your Result').toUpperCase();
    wrapText(ctx, name, cardX + 40, cardY + 130, cardW - 80, 58);

    // Traits
    const traitEntries = Object.entries(traits);
    const traitTop = cardY + 320;
    const rowGap = 52;
    const barW = 420;
    const barH = 14;

    ctx.font = '600 22px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
    traitEntries.forEach(([trait, value], i) => {
      const y = traitTop + i * rowGap;
      ctx.fillStyle = '#e5e7eb';
      ctx.fillText(capitalize(trait), cardX + 40, y);

      // bar bg
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(cardX + 260, y - 16, barW, barH);

      // bar fg
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(cardX + 260, y - 16, Math.max(0, Math.min(1, value / 100)) * barW, barH);

      // value
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`${value}%`, cardX + 260 + barW + 18, y);
    });

    // Footer
    ctx.fillStyle = '#9ca3af';
    ctx.font = '500 18px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText(`Most questionable: Q#${mostQuestionable}`, cardX + 40, cardY + cardH - 44);
    ctx.fillText('Shareable result card • generated locally', cardX + 520, cardY + cardH - 44);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `choice-engine-${(personalityType || 'result').toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ');
    let line = '';
    let yy = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, yy);
        line = words[n] + ' ';
        yy += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line.trim()) ctx.fillText(line.trim(), x, yy);
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const buildRewindAlternate = () => {
    if (!answers.length) return null;
    const idx = Math.max(0, answers.length - 1);
    const flipped = [...answers];
    flipped[idx] = flipped[idx] === 'A' ? 'B' : 'A';
    const r = computeResults(flipped);
    return { questionNumber: idx + 1, personalityType: r.personalityType, traits: r.traits };
  };

  const rewindOneQuestion = () => {
    if (!answers.length) return;
    const idx = Math.max(0, answers.length - 1);
    setStage('questions');
    setCurrentQuestion(idx);
    setAnswers((a) => a.slice(0, idx));
    setIsProcessing(false);
    setShuffleButtons(false);
    setShowDifferentPanel(false);
  };



  const buildAlternate = () => {
    // Try flipping one choice that changes the final personality type.
    const currentType = personalityType;
    let chosenIndex = Math.max(0, (mostQuestionable || 8) - 1);
    let bestAlt = null as null | { questionNumber: number; personalityType: string; traits: { empathy: number; utilitarianism: number; ego: number; chaos: number } };

    for (let i = 0; i < answers.length; i++) {
      const flipped = [...answers];
      flipped[i] = flipped[i] === 'A' ? 'B' : 'A';
      const r = computeResults(flipped);
      if (r.personalityType !== currentType) {
        chosenIndex = i;
        bestAlt = { questionNumber: i + 1, personalityType: r.personalityType, traits: r.traits };
        break;
      }
    }

    if (!bestAlt) {
      const flipped = [...answers];
      flipped[chosenIndex] = flipped[chosenIndex] === 'A' ? 'B' : 'A';
      const r = computeResults(flipped);
      bestAlt = { questionNumber: chosenIndex + 1, personalityType: r.personalityType, traits: r.traits };
    }

    setAlternate(bestAlt);
    setShowDifferentPanel(true);
  };

  const restart = () => {
    setStage('landing');
    setCurrentQuestion(0);
    setAnswers([]);
    setShowTimer(false);
    setTimeLeft(30);
    setIsDelayed(false);
    setIsProcessing(false);
    setShuffleButtons(false);
  };

  if (stage === 'landing') {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-4">
        <Link href="/" className="odd-interactive fixed top-4 left-4 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-100 transition-colors">← experiments</Link>
        <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-black dark:text-white tracking-tight">
              The Choice Engine
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-neutral-300">
              Every choice changes who you are.
            </p>
          </div>

          <button
            onClick={startGame}
            className="group inline-flex items-center gap-2 bg-black text-white px-8 py-4 text-lg font-medium hover:bg-gray-800 transition-all duration-300 hover:gap-4"
          >
            Start
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'questions') {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const showBack = currentQuestion > 0 && currentQuestion <= 5;

    const buttons = [
      { key: 'A', label: question.optionA, choice: 'A' as Choice },
      { key: 'B', label: question.optionB, choice: 'B' as Choice }
    ];

    const displayButtons = shuffleButtons ? [...buttons].reverse() : buttons;

    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-4">
        <Link href="/" className="odd-interactive fixed top-4 left-4 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-100 transition-colors">← experiments</Link>
        <div className="max-w-3xl w-full space-y-12">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              {showTimer && (
                <span className="text-red-600 font-medium animate-pulse">
                  {timeLeft}s remaining
                </span>
              )}
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="text-center space-y-8 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white leading-tight">
              {question.text}
            </h2>

            <div className="flex flex-col gap-4 max-w-xl mx-auto">
              {displayButtons.map((btn, index) => (
                <button
                  key={btn.key}
                  onClick={() => handleAnswer(btn.choice)}
                  disabled={isProcessing}
                  className="group w-full bg-gray-100 text-black hover:bg-black hover:text-white dark:bg-neutral-900 dark:text-white dark:hover:bg-white dark:hover:text-black text-left px-6 py-6 text-lg font-medium transition-all duration-300 disabled:opacity-50 border-2 border-transparent hover:border-black dark:hover:border-white/20"
                >
                  <span className="block text-sm text-gray-500 dark:text-white/60 group-hover:text-gray-300 dark:group-hover:text-black/60 mb-2">
                    Option {btn.key}
                  </span>
                  {btn.label}
                </button>
              ))}
            </div>

            {showBack && (
              <button
                onClick={goBack}
                className="text-gray-500 hover:text-black dark:text-white/60 dark:hover:text-white transition-colors text-sm"
              >
                ← Go back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    if (secretEnding && !revealFromSecret) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-3xl w-full space-y-10">
            <div className="text-center space-y-4">
              <p className="text-xs tracking-widest text-gray-400">THE CHOICE ENGINE</p>
              <h2 className="text-4xl md:text-6xl font-bold ce-glitch" data-text="YOU BROKE THE ENGINE">
                YOU BROKE THE ENGINE
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Your decisions produced an unstable profile. The system can’t classify you.
              </p>
            </div>

            <div className="border border-gray-800 rounded-2xl p-6 bg-gray-900/40">
              <p className="text-sm text-gray-400">Want to see what you <span className="text-white">almost</span> became?</p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setRevealFromSecret(true)}
                  className="inline-flex items-center justify-center rounded-full bg-white dark:bg-neutral-950 text-black dark:text-white px-6 py-3 font-medium hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  Reveal my closest result
                </button>
                <button
                  onClick={downloadResultPng}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-700 px-6 py-3 font-medium hover:bg-gray-900 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download PNG
                </button>
                <button
                  onClick={shareResult}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-700 px-6 py-3 font-medium hover:bg-gray-900 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Copy share text
                </button>

                <button
                  onClick={startGame}
                  className="inline-flex items-center justify-center rounded-full border border-gray-700 px-6 py-3 font-medium hover:bg-gray-900 transition-colors"
                >
                  Play again
                </button>
              </div>
            </div>

            <WhatNext currentHref="/choice-engine" />

            <div className="text-center text-xs text-gray-500">
              Tip: try making one calmer choice early.
            </div>
          </div>
        </div>
      );
    }

    const type = personalityTypes.find(pt => pt.name === personalityType) || personalityTypes[0];

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-3xl w-full space-y-12 animate-fade-in">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold">
              {personalityType}
            </h2>

            {playStats && (
              <p className="text-sm text-gray-500">
                Seen in <span className="text-gray-300 font-medium">{playStats.percent}%</span> of plays on this browser ({playStats.typeCount}/{playStats.total}).
              </p>
            )}
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {type.description}
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Most people regret question #{Math.max(1, mostQuestionable || answers.length)}.
            </p>
          </div>

          {(() => {
            const alt = buildRewindAlternate();
            if (!alt) return null;
            return (
              <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm text-gray-300">If you had chosen differently…</div>
                <div className="mt-2 text-xs text-gray-500">A blurred preview (question #{alt.questionNumber}).</div>
                <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xl font-semibold blur-sm select-none">{alt.personalityType}</div>
                  <div className="mt-2 text-sm text-gray-400 blur-sm select-none">an alternate ending.</div>
                </div>
                <button
                  onClick={rewindOneQuestion}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-100 hover:bg-white/10"
                >
                  Rewind 1 question
                </button>
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-6">
            {Object.entries(traits).map(([trait, value]) => (
              <div key={trait} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium capitalize">{trait}</span>
                  <span className="text-2xl font-bold">{value}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white dark:bg-neutral-950 transition-all duration-1000"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border-l-4 border-red-600 pl-6 py-4 bg-gray-900">
            <p className="text-lg">
              Your most questionable decision was <span className="font-bold text-red-500">Question #{mostQuestionable}</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={shareResult}
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-neutral-950 text-black dark:text-white px-6 py-3 font-medium hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share your result
            </button>
            <button
              onClick={downloadResultPng}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-700 px-6 py-3 font-medium hover:bg-gray-900 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download PNG
            </button>

            <button
              onClick={restart}
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-6 py-3 font-medium hover:bg-white dark:bg-neutral-950 hover:text-black dark:hover:text-white transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Start over
            </button>
          </div>

          {showDifferentTeaser && !showDifferentPanel && (
            <div className="mt-10 text-center animate-fade-in">
              <button
                onClick={buildAlternate}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                <span className="glitch underline underline-offset-4" data-text="You could have been different.">You could have been different.</span>
              </button>
            </div>
          )}

          {showDifferentPanel && alternate && (
            <div className="mt-10 border border-gray-800 rounded-2xl p-6 bg-gray-900/40 animate-fade-in">
              <p className="text-sm text-gray-400">
                With one different choice (Question <span className="font-semibold text-white">#{alternate.questionNumber}</span>), your result would shift to:
              </p>

              <div className="mt-4 rounded-xl border border-gray-800 bg-black/40 p-5">
                <p className="text-xs text-gray-500 mb-2">{alternateReveal ? "Revealed" : "Revealing…"}</p>
                <h3 className={`text-2xl md:text-3xl font-bold text-white transition-all transition-[opacity,filter,transform] duration-1000 ease-out ${alternateReveal ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-md translate-y-1"}`}>
                  {alternate.personalityType}
                </h3>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {Object.entries(alternate.traits).map(([trait, value]) => (
                  <div key={trait} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize text-gray-300">{trait}</span>
                      <span className="text-lg font-bold text-white">{value}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white dark:bg-neutral-950 transition-all duration-1000"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    setShowDifferentPanel(false);
                    setAlternate(null);
                    setShowDifferentTeaser(true);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

<CopyLink />
