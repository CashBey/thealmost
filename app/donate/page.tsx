import Link from "next/link";
import DonateCrypto from "../components/DonateCrypto";

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-[#0f0f10] dark:text-neutral-100">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          <Link href="/" className="hover:underline">
            home
          </Link>
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Donate</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          If an experiment made you feel something (or nothing), you can support the site here. No
          perks, no promises — just fuel for more odd little ideas.
        </p>

        <div className="mt-8">
          <DonateCrypto />
        </div>

        <div className="mt-10 text-xs text-neutral-500 dark:text-neutral-400">
          Tip: you can also share the site with a friend. That helps a lot.
        </div>
      </div>
    </main>
  );
}
