"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EXPERIMENT_CARDS } from "@/lib/experiments";

type Filter = "ALL" | "ACTIVE" | "COMING_SOON";

function isComingSoon(c: { disabled?: boolean; href?: string }) {
  return !!c.disabled || !c.href;
}

export default function ExperimentsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");

  const cards = useMemo(() => {
    const query = q.trim().toLowerCase();

    return EXPERIMENT_CARDS.filter((c) => {
      if (filter === "ACTIVE" && isComingSoon(c)) return false;
      if (filter === "COMING_SOON" && !isComingSoon(c)) return false;

      if (!query) return true;
      return (
        c.title.toLowerCase().includes(query) ||
        c.subtitle.toLowerCase().includes(query)
      );
    });
  }, [q, filter]);

  return (
    <div className="min-h-screen px-5 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-2xl font-semibold tracking-tight">Experiments</div>
            <div className="mt-1 text-sm opacity-60">
              a small catalog of odd little experiments.
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex gap-2">
              {(["ALL", "ACTIVE", "COMING_SOON"] as const).map((k) => {
                const active = filter === k;
                return (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={[
                      "rounded-xl border px-3 py-2 text-xs transition",
                      active
                        ? "border-black/20 bg-black text-white dark:border-white/20 dark:bg-white dark:text-black"
                        : "border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5",
                    ].join(" ")}
                  >
                    {k === "ALL" ? "All" : k === "ACTIVE" ? "Active" : "Coming soon"}
                  </button>
                );
              })}
            </div>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm outline-none placeholder:opacity-50 focus:border-black/30 dark:border-white/10 dark:focus:border-white/30 sm:w-60"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => {
            const disabled = isComingSoon(c);
            const CardInner = (
              <div
                className={[
                  "rounded-2xl border p-4 transition",
                  "border-black/10 dark:border-white/10",
                  disabled ? "opacity-60" : "hover:scale-[1.01] hover:bg-black/5 dark:hover:bg-white/5",
                ].join(" ")}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                  <Image
                    src={c.imageSrc}
                    alt={c.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                    priority={false}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">{c.title}</div>
                  {c.badge ? (
                    <div className="rounded-full border border-black/10 px-2 py-0.5 text-[10px] opacity-70 dark:border-white/10">
                      {c.badge}
                    </div>
                  ) : null}
                </div>
                <div className="mt-1 text-xs opacity-60">{c.subtitle}</div>

                <div className="mt-3 text-xs underline opacity-70">
                  {disabled ? "Coming soon" : "Open"}
                </div>
              </div>
            );

            return disabled ? (
              <div key={c.title}>{CardInner}</div>
            ) : (
              <Link key={c.title} href={c.href as string}>
                {CardInner}
              </Link>
            );
          })}
        </div>

        {cards.length === 0 ? (
          <div className="mt-10 text-sm opacity-60">No matches.</div>
        ) : null}

        <div className="mt-12 text-xs opacity-50">
          Tip: share any experiment link directly — each page is standalone.
        </div>

        <div className="mt-4 text-sm">
          <Link className="underline opacity-70 hover:opacity-100" href="/">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
