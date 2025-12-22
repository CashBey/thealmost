"use client";

import { useMemo, useState } from "react";
import CopyLink from "../components/CopyLink";

type Item = {
  id: string;
  title: string;
  cost: number; // USD (0 means "not for sale")
  whisper: string;
  kind: "buy" | "notForSale";
};

const INITIAL_WEALTH = 320_000_000_000; // intentionally abstract
const TARGET_INTERACTIONS = 12;

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
  const [whisper, setWhisper] = useState("This number will go down. You won’t feel it.");

  const [interactions, setInteractions] = useState(0);
  const [undoAvailable, setUndoAvailable] = useState(true);
  const [ended, setEnded] = useState(false);

  const rotatingWhispers = useMemo(
    () => [
      "This didn’t feel different.",
      "You expected resistance.",
      "Nothing pushed back.",
      "Power is quiet from here.",
      "You thought this would matter more.",
      "You stopped noticing the number.",
      "That’s the point.",
    ],
    []
  );

  const purchasables: Item[] = useMemo(
    () => [
      // power / scale
      { id: "country", title: "Buy a country", cost: 50_000_000_000, whisper: "Borders are cheaper than they look.", kind: "buy" },
      { id: "platform", title: "Own a global platform", cost: 44_000_000_000, whisper: "A conversation, controlled.", kind: "buy" },
      { id: "market", title: "Control a market for a day", cost: 10_000_000_000, whisper: "Stability, temporarily.", kind: "buy" },

      // human / life
      { id: "time_year", title: "One year of someone’s time", cost: 60_000, whisper: "Priceless. Sold daily.", kind: "buy" },
      { id: "home", title: "A home", cost: 400_000, whisper: "Safety, quantified.", kind: "buy" },
      { id: "meal", title: "A warm meal", cost: 15, whisper: "Forgotten by tomorrow.", kind: "buy" },
      { id: "doctor_visit", title: "A doctor visit", cost: 200, whisper: "Relief, on a schedule.", kind: "buy" },
      { id: "flight", title: "A flight to anywhere", cost: 1_200, whisper: "Distance, compressed.", kind: "buy" },
    ],
    []
  );

  const notForSale: Item[] = useMemo(
    () => [
      { id: "trust", title: "Trust", cost: 0, whisper: "Not for sale.", kind: "notForSale" },
      { id: "love", title: "Love", cost: 0, whisper: "Not for sale.", kind: "notForSale" },
      { id: "consent", title: "Consent", cost: 0, whisper: "Not for sale.", kind: "notForSale" },
      { id: "time_spent", title: "Time you already spent", cost: 0, whisper: "Not for sale.", kind: "notForSale" },
      { id: "clean_conscience", title: "A clean conscience", cost: 0, whisper: "Not for sale.", kind: "notForSale" },
      { id: "silence", title: "Silence for an hour", cost: 0, whisper: "Not for sale.", kind: "notForSale" },
    ],
    []
  );

  function nextWhisper(nextInteractionCount: number) {
    const idx = Math.min(nextInteractionCount, rotatingWhispers.length - 1);
    return rotatingWhispers[idx] ?? rotatingWhispers[rotatingWhispers.length - 1];
  }

  function advanceInteraction() {
    setInteractions((i) => {
      const next = i + 1;
      setWhisper(nextWhisper(next));
      if (next >= TARGET_INTERACTIONS) {
        setEnded(true);
      }
      return next;
    });
  }

  function buy(item: Item) {
    if (ended) return;

    if (item.cost === 0) {
      // "not for sale" — still counts as an interaction
      setHistory((h) => [...h, item]);
      setWhisper(item.whisper);
      advanceInteraction();
      return;
    }

    if (item.cost > remaining) return;

    setRemaining((r) => r - item.cost);
    setHistory((h) => [...h, item]);
    advanceInteraction();
  }

  function undoOnce() {
    if (ended) return;
    if (!undoAvailable) return;

    const last = history.at(-1);
    if (!last) return;

    // remove last history entry
    setHistory((h) => h.slice(0, -1));

    // refund only if it was a real purchase
    if (last.cost > 0) {
      setRemaining((r) => r + last.cost);
    }

    setUndoAvailable(false);
    setWhisper("Undo is no longer available.");
    // Do not reduce interactions: the feeling should remain.
  }

  function reset() {
    setRemaining(INITIAL_WEALTH);
    setHistory([]);
    setWhisper("This number will go down. You won’t feel it.");
    setInteractions(0);
    setUndoAvailable(true);
    setEnded(false);
  }

  const progress = Math.min(1, interactions / TARGET_INTERACTIONS);

  return (
    <div className="min-h-screen px-6 py-16 flex justify-center">
      <div className="max-w-xl w-full space-y-10">
        <header className="space-y-3">
          <h1 className="text-2xl font-medium">The Richest Person Alive</h1>
          <p className="text-sm opacity-70">
            For a moment,
            <br />
            you have more money than anyone who has ever lived.
          </p>
        </header>

        <section className="space-y-3">
          <div className="text-3xl font-mono">{formatUSD(remaining)}</div>

          {/* thin bar: "it gets easier" (unnamed) */}
          <div className="h-[2px] w-full rounded bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-black/40 dark:bg-white/40"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="text-xs opacity-50 italic">{whisper}</div>

          <div className="flex items-center justify-between text-[11px] opacity-45">
            <span>{interactions}/{TARGET_INTERACTIONS}</span>
            <div className="flex items-center gap-4">
              {history.length > 0 && undoAvailable && (
                <button
                  onClick={undoOnce}
                  className="opacity-70 hover:opacity-100 underline transition"
                >
                  undo
                </button>
              )}
              {!undoAvailable && <span>undo</span>}
            </div>
          </div>
        </section>

        {!ended ? (
          <>
            <section className="space-y-3">
              <div className="text-sm font-medium opacity-80">You can buy:</div>
              <div className="space-y-3">
                {purchasables.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => buy(item)}
                    disabled={item.cost > remaining}
                    className="w-full text-left rounded-xl border border-black/10 dark:border-white/10 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition disabled:opacity-40"
                  >
                    <div className="flex justify-between gap-4">
                      <span className="text-sm">{item.title}</span>
                      <span className="text-xs opacity-60">{formatUSD(item.cost)}</span>
                    </div>
                    <div className="mt-1 text-xs opacity-50 italic">{item.whisper}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3 pt-2">
              <div className="text-sm font-medium opacity-70">Things money can’t buy:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {notForSale.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => buy(item)}
                    className="w-full text-left rounded-xl border border-black/10 dark:border-white/10 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    <div className="flex justify-between gap-4">
                      <span className="text-sm">{item.title}</span>
                      <span className="text-xs opacity-50">—</span>
                    </div>
                    <div className="mt-1 text-xs opacity-50 italic">{item.whisper}</div>
                  </button>
                ))}
              </div>
            </section>

            {history.length > 0 && (
              <section className="space-y-2 pt-2">
                <div className="text-xs opacity-50">Recent</div>
                <ul className="text-sm space-y-1">
                  {history.slice(-5).reverse().map((h) => (
                    <li key={`${h.id}-${Math.random()}`} className="flex justify-between gap-4">
                      <span className="opacity-80">{h.title}</span>
                      <span className="text-xs opacity-60">
                        {h.cost > 0 ? formatUSD(h.cost) : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <section className="space-y-4">
            <div className="text-lg">You are still here.</div>
            <div className="text-sm opacity-60">The number is smaller.</div>
            <div className="text-xs opacity-50 italic">It got easier.</div>
            <button
              onClick={reset}
              className="text-xs opacity-60 hover:opacity-100 underline transition"
            >
              reset
            </button>
          </section>
        )}

        <footer className="pt-4">
          <CopyLink />
        </footer>
      </div>
    </div>
  );
}
