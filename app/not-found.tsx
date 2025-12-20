import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#0f0f10] dark:text-white">
      <div className="mx-auto max-w-xl px-6 py-16">
        <div className="text-2xl sm:text-3xl font-semibold tracking-tight">Not found.</div>
        <div className="mt-3 text-sm opacity-70">
          This experiment doesn&apos;t exist. Or it does, but not here.
        </div>

        <Link href="/" className="mt-10 inline-block text-sm underline odd-interactive">
          Go home
        </Link>
      </div>
    </div>
  );
}
