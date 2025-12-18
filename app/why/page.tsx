"use client";

import Link from "next/link";
import DonateCrypto from "../components/DonateCrypto";

export default function WhyPage() {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#0f0f10] dark:text-white">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Link
          href="/"
          className="odd-interactive text-sm opacity-60 hover:opacity-100 transition"
        >
          ← back
        </Link>

        <h1 className="mt-10 text-3xl font-semibold tracking-tight">
          why this exists
        </h1>

        <p className="mt-4 opacity-70">
          small experiments about choices, interfaces, and the feeling after clicking.
        </p>
        <p className="mt-3 opacity-70">
          no feeds. no accounts. no optimization. just quiet interaction.
        </p>

        <p
          data-odd-shift
          className="mt-6 text-sm opacity-50"
        >
          nothing here is trying to convince you.
        </p>

        <div className="mt-10">
          <DonateCrypto />
        </div>
      </div>
    </div>
  );
}
