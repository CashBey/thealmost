import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-[#0f0f10] dark:text-neutral-100">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          <Link href="/" className="hover:underline">
            home
          </Link>
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">About</h1>

        <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          <p>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">thealmost</span> is a small collection
            of interactive experiments.
          </p>
          <p>Not tools. Not productivity. Just ideas you can click, wait for, or regret.</p>
          <p>If something feels a little pointless, it’s probably working.</p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/spend-satoshi"
            className="rounded-xl border border-black/10 px-3 py-2 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
          >
            try an experiment
          </Link>
          <Link
            href="/why"
            className="rounded-xl border border-black/10 px-3 py-2 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
          >
            why this exists
          </Link>

<Link
  href="/donate"
  className="rounded-xl border border-black/10 px-3 py-2 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
>
  donate
</Link>

        </div>
      </div>
    </main>
  );
}
