"use client";

import { useEffect, useRef, useState } from "react";
import CopyLink from "../components/CopyLink";

type Result =
  | "You hesitate more than you decide."
  | "You commit quickly, even when it doesn’t matter."
  | "You try to optimize nothing."
  | "You moved a lot, but chose little."
  | "You waited for permission that never came.";

export default function SpendSatoshi() {
  const startTime = useRef<number>(Date.now());
  const moves = useRef<number>(0);
  const firstDirection = useRef<"left" | "right" | null>(null);
  const maxDistance = useRef<number>(0);

  const [value, setValue] = useState(50);
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  function onMove(v: number) {
    if (firstDirection.current === null) {
      firstDirection.current = v > value ? "right" : "left";
    }

    moves.current += 1;
    maxDistance.current = Math.max(maxDistance.current, Math.abs(v - 50));
    setValue(v);
  }

  function confirm() {
    const timeSpent = Date.now() - startTime.current;

    let r: Result;

    if (timeSpent > 8000 && moves.current < 5) {
      r = "You waited for permission that never came.";
    } else if (moves.current > 25 && maxDistance.current < 20) {
      r = "You try to optimize nothing.";
    } else if (firstDirection.current === "right" && timeSpent < 3000) {
      r = "You commit quickly, even when it doesn’t matter.";
    } else if (moves.current > 15 && maxDistance.current > 40) {
      r = "You moved a lot, but chose little.";
    } else {
      r = "You hesitate more than you decide.";
    }

    setConfirmed(true);

    setTimeout(() => {
      setResult(r);
    }, 900);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-10">
        {!confirmed && (
          <>
            <div className="space-y-3">
              <h1 className="text-2xl font-medium">Spend Satoshi</h1>
              <p className="text-sm opacity-70">
                You have one satoshi.
                <br />
                You may spend it.
              </p>
            </div>

            <div className="space-y-6">
              <input
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={(e) => onMove(Number(e.target.value))}
                className="w-full"
              />

              <div className="flex justify-between text-xs opacity-40">
                <span>Keep it</span>
                <span>Spend it</span>
              </div>
            </div>

            <button
              onClick={confirm}
              className="text-xs opacity-60 hover:opacity-100 transition underline"
            >
              confirm
            </button>
          </>
        )}

        {confirmed && !result && (
          <div className="text-sm opacity-60">Measuring…</div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="text-lg">{result}</div>

            <div className="text-xs opacity-50">
              The satoshi remains.
            </div>

            <CopyLink />
          </div>
        )}
      </div>
    </div>
  );
}
