'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Shuffle } from 'lucide-react';
import { ACTIVE_EXPERIMENTS } from '../../lib/experiments';

function pickRandomExcept(currentHref: string) {
  const pool = ACTIVE_EXPERIMENTS.filter((e) => e.href !== currentHref);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function WhatNext({ currentHref }: { currentHref: string }) {
  const next = useMemo(() => pickRandomExcept(currentHref), [currentHref]);
  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <Link
        href={next.href}
        className="odd-interactive inline-flex items-center gap-2 rounded-full border border-black/10 bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 dark:border-white/10 dark:bg-white dark:text-black"
      >
        <Shuffle className="h-4 w-4" />
        Try another experiment
      </Link>
      <div data-odd-shift className="text-[12px] opacity-55">Next: {next.title}</div>
    </div>
  );
}
