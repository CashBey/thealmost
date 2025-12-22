"use client";

import { useMemo, useState } from "react";
import CopyLink from "../components/CopyLink";

type Item = {
  id: string;
  title: string;
  cost: number;
  whisper: string;
};

const INITIAL_WEALTH = 320_000_000_000;

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function TheRichestPersonAlive() {
  const [remaining, setRemaining] = useState(INITIAL_WEALTH);
  const [history, setHistory] = useState<Item[]>([]);
  const [whisper, setWhisper] = useState(
    "This number will go down. You won’t feel it."
  );

  const whispers = useMemo(
    () => [
      "This didn’t feel different.",
      "You expected resistance.",
      "Nothing pushed back.",
      "Power is quiet from here.",
      "You thought this would matter more.",
    ],
    []
  );

  const items: Item[] = useMemo(
    () => [
      { id: "country", title: "Buy a country", cost: 50_000_000_000, whisper: "Borders are cheaper than they look." },
      { id: "platform", title: "Own a global platform", cost: 44_000_000_000, whisper: "A conversation, controlled." },
      { id: "debt", title: "Erase a generation’s debt", cost: 1_700_000_000_000, whisper: "Forgiveness is expensive." },
      { id: "market", title: "Control a market for a day", cost: 10_000_000_000, whisper: "Stability, temporarily." },
      { id: "time", title: "One year of someone’s time", cost: 60_000, whisper: "Priceless. Sold daily." },
      { id: "home", title: "A home", cost: 400_000, whisper: "Safety, quantified." },
      { id: "meal", title: "A warm meal", cost: 15, whisper: "Forgotten by tomorrow." },
      { id: "silence", title: "Silence for an hour", cost: 0, whisper: "Not for sale." },
    ],
    []
  );

  function buy(item: Item) {
    if (item.cost === 0) {
      setWhisper(item.whisper);
      setHistory((h) => [...h, item]);
      return;
    }
    if (item.cost > remaining) return;
    setRemaining((r) => r - item.cost);
    setHistory((h) => [...h, item]);
    setWhisper(whispers[Math.min(history.length, whispers.length - 1)]);
  }

  function reset() {
    setRemaining(INITIAL_WEALTH);
    setHistory([]);
    setWhisper("This number will go down. You won’t feel it.");
  }

  const exhausted = remaining <= 0;

  return (
    <div className="min-h-screen px-6 py-16 flex justify-center">
      <div className="max-w-xl w-full space-y-10">
        <header className="space-y-3">
          <h1 className="text-2xl font-medium">The Richest Person Alive</h1>
          <p className="text-sm opacity-70">
            For a moment,<br />you have more money than anyone who has ever lived.
          </p>
        </header>

        <section className="space-y-2">
          <div className="text-3xl font-mono">{formatUSD(remaining)}</div>
          <div className="text-xs opacity-50 italic">{whisper}</div>
        </section>

        {!exhausted && (
          <section className="space-y-3">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => buy(item)}
                disabled={item.cost > remaining && item.cost !== 0}
                className="w-full text-left rounded-xl border border-black/10 px-4 py-3 hover:bg-black/5 transition disabled:opacity-40"
              >
                <div className="flex justify-between gap-4">
                  <span className="text-sm">{item.title}</span>
                  {item.cost > 0 && (
                    <span className="text-xs opacity-60">{formatUSD(item.cost)}</span>
                  )}
                </div>
                <div className="mt-1 text-xs opacity-50 italic">{item.whisper}</div>
              </button>
            ))}
          </section>
        )}

        {exhausted && (
          <section className="space-y-4">
            <div className="text-lg">You are still here.</div>
            <div className="text-sm opacity-60">The money is gone.</div>
            <button onClick={reset} className="text-xs opacity-60 hover:opacity-100 underline">reset</button>
          </section>
        )}

        <footer className="pt-4">
          <CopyLink />
        </footer>
      </div>
    </div>
  );
}
