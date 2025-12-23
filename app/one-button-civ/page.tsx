"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Era = 0 | 1 | 2 | 3 | 4 | 5;

const ERAS: { name: string; button: string }[] = [
  { name: "Hunter-Gatherer", button: "advance" },
  { name: "Agriculture", button: "advance" },
  { name: "Industry", button: "advance" },
  { name: "Internet", button: "advance" },
  { name: "AI", button: "advance" },
  { name: "Collapse", button: "press anyway" },
];

const TEXT: Record<Era, { normal: string[]; crisis: string[]; milestone: string }> = {
  0: {
    normal: ["we follow food.", "the fire stays lit.", "storms teach planning.", "sharing keeps us alive."],
    crisis: ["too much noise scares the herd.", "the path splits.", "we move too fast."],
    milestone: "we stop calling it luck.",
  },
  1: {
    normal: ["we stop moving.", "storage becomes power.", "seasons become schedules.", "we fence the world."],
    crisis: ["soil gets tired.", "the river is thinner.", "we argue over borders."],
    milestone: "we invent surplus.",
  },
  2: {
    normal: ["machines eat time.", "air tastes different.", "work becomes a unit.", "cities learn to hum."],
    crisis: ["smoke becomes weather.", "distance becomes delay.", "maintenance replaces wonder."],
    milestone: "we automate muscle.",
  },
  3: {
    normal: ["truth becomes a format.", "attention becomes currency.", "everyone speaks at once.", "maps replace places."],
    crisis: ["signal outruns meaning.", "the feed decides.", "nobody knows what’s real today."],
    milestone: "we outsource memory.",
  },
  4: {
    normal: ["systems write systems.", "the output looks like authority.", "we optimize what we can measure.", "no one can explain it fully."],
    crisis: ["control feels like a dashboard.", "we confuse speed for safety.", "the model learns the wrong lesson."],
    milestone: "we automate thinking.",
  },
  5: {
    normal: ["the system collapsed quietly.", "it kept running. just not for you.", "progress turns into scavenging."],
    crisis: ["silence spreads.", "nobody is in charge.", "the lights flicker with meaning."],
    milestone: "collapse is a process.",
  },
};

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export default function OneButtonCiv() {
  // core state
  const [era, setEra] = useState<Era>(0);
  const [momentum, setMomentum] = useState(0); // how aggressively the user is pressing
  const [stability, setStability] = useState(1); // resilience
  const [line, setLine] = useState(TEXT[0].normal[0]);
  const [log, setLog] = useState<string[]>([]);

  // hidden progress (no bars)
  const eraCharge = useRef(0); // 0..1 to next era
  const [inputLagMs, setInputLagMs] = useState(0);
  const [isBusy, setIsBusy] = useState(false);

  // alignment twist
  const [aligned, setAligned] = useState(false);
  const alignedMs = useRef(0);
  const lastLineTick = useRef(0);

  const complexity = useMemo(() => {
    // grows with era (collapse still high complexity, just broken)
    const base = [0.05, 0.2, 0.45, 0.65, 0.85, 0.9][era];
    return base;
  }, [era]);

  const stress = useMemo(() => clamp01(momentum * (0.35 + complexity)), [momentum, complexity]);

  // push a unique line to history (milestone-ish, but sparse)
  const pushLog = (s: string) => {
    setLog((prev) => (prev.includes(s) ? prev : [...prev, s]));
  };

  // tick loop
  useEffect(() => {
    const tickMs = 220;

    const id = window.setInterval(() => {
      // decay momentum naturally (waiting matters)
      setMomentum((m) => clamp01(m - 0.035));

      // stability: recovers when calm, degrades under stress & complexity
      setStability((s) => {
        const recover = 0.018 * (1 - stress) * (1 - complexity * 0.75);
        const damage = 0.03 * stress * (0.4 + complexity);
        return clamp01(s + recover - damage);
      });

      // occasionally update the world line (especially under stress)
      const now = Date.now();
      const shouldSpeak = now - lastLineTick.current > (stress > 0.55 ? 650 : 1100);
      if (shouldSpeak) {
        lastLineTick.current = now;
        if (era === 5) {
          setLine(pick(TEXT[5].normal));
        } else {
          setLine(stability < 0.45 ? pick(TEXT[era].crisis) : pick(TEXT[era].normal));
        }
      }

      // alignment tracking (AI era only)
      if (!aligned && era === 4) {
        const calm = stability > 0.82 && momentum < 0.18; // you stopped poking it
        if (calm) {
          alignedMs.current += tickMs;
          // subtle hints as it gets close (no meter)
          if (alignedMs.current > 3500) pushLog("it starts to feel boring.");
          if (alignedMs.current > 6500) pushLog("you don't get credit for stability.");
        } else {
          alignedMs.current = Math.max(0, alignedMs.current - tickMs * 2); // impatience resets faster
        }

        if (alignedMs.current >= 10000) {
          setAligned(true);
          pushLog("alignment achieved (by doing less).");
          setLine("the system no longer needs input.");
          // once aligned, remove the need for the button
          setInputLagMs(0);
        }
      }

      // era progression (blocked if aligned; collapse doesn't progress)
      if (!aligned && era < 5) {
        // progress is slower when stressed; faster when stable but not too calm
        const progress = 0.09 * (0.25 + momentum) * (0.55 + stability) - 0.08 * stress;
        eraCharge.current = clamp01(eraCharge.current + progress);
        if (eraCharge.current >= 1) {
          eraCharge.current = 0;
          setEra((e) => {
            const next = (e + 1) as Era;
            pushLog(TEXT[next].milestone);
            setLine(TEXT[next].milestone);
            return next;
          });
        }
      }

      // collapse condition
      if (!aligned && era !== 5 && stability < 0.12) {
        setEra(5);
        pushLog("collapse");
        setLine("the system collapsed quietly.");
        eraCharge.current = 0;
        alignedMs.current = 0;
      }

      // in collapse: slow recovery by waiting, and possible soft reset if calm long enough
      if (era === 5 && !aligned) {
        // if user stops pressing, stability climbs; if stable enough for a while, restart
        if (stability > 0.78 && momentum < 0.12) {
          // accumulate calm time using the same counter (cheap)
          alignedMs.current += tickMs;
          if (alignedMs.current > 5200) {
            setEra(0);
            setLine("we start again. we pretend it’s new.");
            pushLog("restart");
            alignedMs.current = 0;
          }
        } else {
          alignedMs.current = 0;
        }
      }

      // input lag grows with stress (but keep it subtle)
      setInputLagMs(() => {
        if (aligned) return 0;
        const base = stress > 0.6 ? 120 : 0;
        const extra = stress > 0.75 ? 220 : 0;
        return base + extra;
      });
    }, tickMs);

    return () => window.clearInterval(id);
  }, [era, stress, stability, momentum, aligned, complexity]);

  const press = () => {
    if (aligned) {
      // nothing should happen; but we can be a little uncanny
      setLine("it already moved on.");
      pushLog("the button became decorative.");
      return;
    }
    if (isBusy) return;

    const doPress = () => {
      // pressing increases momentum and stress; hurts stability more as complexity rises
      setMomentum((m) => clamp01(m + 0.18));
      setStability((s) => clamp01(s - (0.028 + complexity * 0.05)));

      // give immediate feedback
      setLine(stability < 0.45 ? pick(TEXT[era].crisis) : pick(TEXT[era].normal));

      // spam penalty: occasional "stuck" feeling
      if (stress > 0.72 && Math.random() < 0.18) {
        setIsBusy(true);
        setLine("...");
        window.setTimeout(() => setIsBusy(false), 420);
      }
    };

    if (inputLagMs > 0) {
      setIsBusy(true);
      window.setTimeout(() => {
        setIsBusy(false);
        doPress();
      }, inputLagMs);
    } else {
      doPress();
    }
  };

  const buttonText = aligned ? "it runs without you" : ERAS[era].button;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 px-6 py-12">
      <div className="text-[11px] uppercase tracking-[0.22em] text-neutral-400 dark:text-neutral-500">
        {ERAS[era].name}
      </div>

      <button
        onClick={press}
        disabled={aligned}
        className={[
          "rounded-2xl border border-black/10 bg-white px-10 py-5 text-lg text-neutral-900 shadow-sm transition",
          "hover:shadow-md active:translate-y-[1px]",
          "dark:border-white/10 dark:bg-white/10 dark:text-neutral-100",
          aligned ? "opacity-45 cursor-not-allowed hover:shadow-sm active:translate-y-0" : "",
          isBusy ? "opacity-70" : "",
        ].join(" ")}
      >
        {buttonText}
      </button>

      <div className="max-w-md text-center text-sm text-neutral-700/80 dark:text-neutral-200/80">
        {line}
      </div>

      {log.length > 0 && (
        <section className="w-full max-w-md space-y-2 pt-6">
          {log.map((l, i) => (
            <div key={i} className="text-xs text-neutral-500 dark:text-neutral-400 opacity-70">
              {l}
            </div>
          ))}
        </section>
      )}

      {/* invisible affordance: if aligned, a tiny hint */}
      {aligned && (
        <div className="pt-2 text-[10px] text-neutral-400 dark:text-neutral-500 opacity-70">
          you can leave. it will keep going.
        </div>
      )}
    </main>
  );
}
