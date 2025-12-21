"use client";

import { useEffect, useMemo, useState } from "react";
import CopyLink from "../components/CopyLink";

const SATOSHI_BTC_ESTIMATE = 0.00000001;

type Item = {
  id: string;
  name: string;
  costBTC: number | "∞";
  note?: string;
};

const ITEMS: Item[] = [
  { id: "coffee", name: "Coffee", costBTC: 0.0000004 },
  { id: "sandwich", name: "Sandwich", costBTC: 0.0000009 },
  { id: "book", name: "Book", costBTC: 0.000002 },
  { id: "headphones", name: "Headphones", costBTC: 0.000006 },
  { id: "laptop", name: "Laptop", costBTC: 0.00002 },
  { id: "house", name: "House", costBTC: "∞", note: "Not enough." },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function SpendSatoshi() {
  const [remainingBTC, setRemainingBTC] = useState(SATOSHI_BTC_ESTIMATE);
  const [spentBTC, setSpentBTC] = useState(0);
  const [history, setHistory] = useState<Item[]>([]);

  const items = useMemo(() => ITEMS, []);

  function showToast(text: string) {
    alert(text);
  }

  function attemptBuy(item: Item) {
    if (item.costBTC === "∞") {
      showToast("Unavailable.");
      return;
    }

    if (item.costBTC === 0) {
      showToast("No transaction.");
      return;
    }

    if (remainingBTC <= 0) {
      showToast("Nothing left.");
      return;
    }

    const cost = item.costBTC;

    if (cost > remainingBTC) {
      showToast("Not enough.");
      return;
    }

    setRemainingBTC((r) =>
      clamp(r - cost, 0, SATOSHI_BTC_ESTIMATE)
    );
    setSpentBTC((s) =>
      clamp(s + cost, 0, SATOSHI_BTC_ESTIMATE)
    );
    setHistory((h) => [...h, item]);
  }

  function randomSpend() {
    const affordable = items.filter(
      (item) =>
        item.costBTC !== "∞" &&
        item.costBTC > 0 &&
        item.costBTC <= remainingBTC
    );

    if (affordable.length === 0) return;

    const randomItem =
      affordable[Math.floor(Math.random() * affordable.length)];

    attemptBuy(randomItem);
  }

  const mostRegrettable = history.at(-1);

  return (
    <div className="min-h-screen px-6 py-16 flex justify-center">
      <div className="max-w-xl w-full space-y-8">
        <h1 className="text-2xl font-semibold">Spend Satoshi</h1>

        <p className="text-sm opacity-70">
          You have one satoshi. Spend it.
        </p>

        <div className="text-sm">
          <div>Remaining: {remainingBTC.toFixed(8)} BTC</div>
          <div>Spent: {spentBTC.toFixed(8)} BTC</div>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => attemptBuy(item)}
              className="w-full text-left border rounded-xl px-4 py-3 text-sm hover:bg-black/5 transition disabled:opacity-40"
              disabled={item.costBTC !== "∞" && item.costBTC > remainingBTC}
            >
              <div className="flex justify-between">
                <span>{item.name}</span>
                <span>
                  {item.costBTC === "∞"
                    ? "∞"
                    : `${item.costBTC} BTC`}
                </span>
              </div>
              {item.note && (
                <div className="text-xs opacity-50 mt-1">
                  {item.note}
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={randomSpend}
          className="text-xs opacity-60 hover:opacity-100 transition underline"
        >
          random spend
        </button>

        {mostRegrettable && (
          <div className="text-xs opacity-60">
            Most regrettable purchase: {mostRegrettable.name}
          </div>
        )}

        <CopyLink />
      </div>
    </div>
  );
}
