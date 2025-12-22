"use client";

import { useEffect, useMemo, useState } from "react";
import CopyLink from "../components/CopyLink";

const SATOSHI_BTC_ESTIMATE = 1_100_000; // common estimate: ~1.1M BTC
const REFRESH_MS = 30_000;

type Purchase = {
  id: string;
  title: string;
  costUsd: number;
  // short, non-judgmental framing (quietly philosophical)
  whisper: string;
};

type PriceResponse =
  | { ok: true; btcUsd: number; source: string; ts: number }
  | { ok: false; error: string };

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n >= 1 ? 0 : 6,
  }).format(n);
}

function formatCompactUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);
}

export default function SpendSatoshi() {
  const [btcUsd, setBtcUsd] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [remainingUsd, setRemainingUsd] = useState<number | null>(null);
  const [history, setHistory] = useState<Purchase[]>([]);
  const [whisper, setWhisper] = useState<string>("Numbers stop meaning anything at this scale.");

  const purchases = useMemo<Purchase[]>(
    () => [
      // big (power)
      {
        id: "twitter",
        title: "Buy Twitter (2022 deal)",
        costUsd: 44_000_000_000,
        whisper: "A conversation, owned.",
      },
      {
        id: "world_hunger_year",
        title: "Help fund ending world hunger (1 year target, rough)",
        costUsd: 40_000_000_000,
        whisper: "A promise with no receipt.",
      },
      {
        id: "student_debt",
        title: "Erase US student debt (rough)",
        costUsd: 1_700_000_000_000,
        whisper: "A generation, forgiven.",
      },
      {
        id: "apple",
        title: "Buy Apple (market cap scale, rough)",
        costUsd: 3_000_000_000_000,
        whisper: "Innovation, stabilized.",
      },

      // small (life)
      {
        id: "coffee",
        title: "A cup of coffee",
        costUsd: 4,
        whisper: "Warm. Temporary.",
      },
      {
        id: "meal",
        title: "A simple meal",
        costUsd: 15,
        whisper: "Forgotten by tomorrow.",
      },
      {
        id: "hour_labor",
        title: "One hour of human labor (low-end estimate)",
        costUsd: 20,
        whisper: "Priceless. Sold daily.",
      },
      {
        id: "bus_ticket",
        title: "A bus ticket",
        costUsd: 3,
        whisper: "A small distance.",
      },
      {
        id: "book",
        title: "A book you might not finish",
        costUsd: 18,
        whisper: "Meaning, delayed.",
      },
      {
        id: "bandage",
        title: "A bandage",
        costUsd: 2,
        whisper: "Care, in miniature.",
      },
    ],
    []
  );

  const rotatingWhispers = useMemo(
    () => [
      "Numbers stop meaning anything at this scale.",
      "You can buy outcomes. Not consequences.",
      "Power feels smaller when it becomes a list.",
      "Nothing resists quietly.",
      "The world continues.",
      "This didn’t change what you hoped.",
    ],
    []
  );

  async function fetchPrice() {
    try {
      setPriceError(null);
      const res = await fetch("/api/btc-price", { cache: "no-store" });
      const data = (await res.json()) as PriceResponse;

      if (!data.ok) {
        setPriceError("price unavailable");
        return;
      }

      setBtcUsd(data.btcUsd);
    } catch {
      setPriceError("price unavailable");
    }
  }

  useEffect(() => {
    fetchPrice();
    const t = setInterval(fetchPrice, REFRESH_MS);
    return () => clearInterval(t);
  }, []);

  const totalUsd = useMemo(() => {
    if (btcUsd == null) return null;
    return btcUsd * SATOSHI_BTC_ESTIMATE;
  }, [btcUsd]);

  // initialize remaining once we know total
  useEffect(() => {
    if (totalUsd == null) return;
    setRemainingUsd((prev) => (prev == null ? totalUsd : prev));
  }, [totalUsd]);

  function reset() {
    if (totalUsd == null) return;
    setRemainingUsd(totalUsd);
    setHistory([]);
    setWhisper(rotatingWhispers[0]);
  }

  function buy(p: Purchase) {
    if (remainingUsd == null) return;
    if (p.costUsd > remainingUsd) return;

    const next = remainingUsd - p.costUsd;
    setRemainingUsd(next);
    setHistory((h) => [...h, p]);

    // gentle, rotating “meaning” without lecturing
    const idx = Math.min(history.length + 1, rotatingWhispers.length - 1);
    setWhisper(rotatingWhispers[idx] ?? rotatingWhispers[rotatingWhispers.length - 1]);
  }

  const minCost = useMemo(() => Math.min(...purchases.map((p) => p.costUsd)), [purchases]);
  const exhausted = remainingUsd != null && remainingUsd < minCost;

  return (
    <div className="min-h-screen px-6 py-16 flex justify-center">
      <div className="max-w-2xl w-full space-y-10">
        <header className="space-y-3">
          <h1 className="text-2xl font-medium">Spend Satoshi (If He Did)</h1>
          <p className="text-sm opacity-70">
            Satoshi Nakamoto is estimated to own ~{SATOSHI_BTC_ESTIMATE.toLocaleString("en-US")} BTC.
            <br />
            He never spent any of it.
          </p>
          <p className="text-xs opacity-50 italic">
            Not because he couldn’t. Because he chose not to.
          </p>
        </header>

        <section className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4">
              <div className="text-xs opacity-50">BTC price</div>
              <div className="mt-1">
                {btcUsd == null ? (
                  <span className="opacity-60">{priceError ?? "loading…"}</span>
                ) : (
                  formatUsd(btcUsd)
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4">
              <div className="text-xs opacity-50">Estimated total</div>
              <div className="mt-1">
                {totalUsd == null ? (
                  <span className="opacity-60">—</span>
                ) : (
                  formatCompactUsd(totalUsd)
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 dark:border-white/10 p-4">
              <div className="text-xs opacity-50">Remaining</div>
              <div className="mt-1">
                {remainingUsd == null ? (
                  <span className="opacity-60">—</span>
                ) : (
                  formatCompactUsd(remainingUsd)
                )}
              </div>
            </div>
          </div>

          <div className="text-xs opacity-50 italic">{whisper}</div>

          <div className="text-[11px] opacity-40">
            Estimates vary. This page is a simulation.
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-medium">If he sold today, he could buy:</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {purchases.map((p) => {
              const disabled = remainingUsd == null || p.costUsd > remainingUsd;
              return (
                <button
                  key={p.id}
                  onClick={() => buy(p)}
                  disabled={disabled}
                  className="text-left rounded-2xl border border-black/10 dark:border-white/10 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="text-sm">{p.title}</div>
                    <div className="text-xs opacity-60">{formatCompactUsd(p.costUsd)}</div>
                  </div>
                  <div className="mt-2 text-xs opacity-50 italic">{p.whisper}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          {exhausted && (
            <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5 space-y-3">
              <div className="text-lg font-medium">He didn’t.</div>
              <div className="text-sm opacity-70">And the world adjusted anyway.</div>
              <div className="text-xs opacity-50 italic">
                This was a simulation. Reality is quieter.
              </div>
              <button
                onClick={reset}
                className="text-xs opacity-60 hover:opacity-100 transition underline"
              >
                try a different world
              </button>
            </div>
          )}

          {!exhausted && history.length > 0 && (
            <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5 space-y-2">
              <div className="text-xs opacity-50">Recent buys</div>
              <ul className="text-sm space-y-1">
                {history.slice(-5).reverse().map((p) => (
                  <li key={p.id} className="flex justify-between gap-4">
                    <span className="opacity-80">{p.title}</span>
                    <span className="text-xs opacity-60">{formatCompactUsd(p.costUsd)}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={reset}
                className="mt-3 text-xs opacity-60 hover:opacity-100 transition underline"
              >
                reset simulation
              </button>
            </div>
          )}
        </section>

        <footer className="pt-2">
          <CopyLink />
        </footer>
      </div>
    </div>
  );
}
