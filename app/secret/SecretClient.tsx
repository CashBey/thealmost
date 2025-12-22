"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export const secretMetadata = {
  title: "Secret — thealmost",
  description: "You found it.",
};

export default function SecretClient() {
  const router = useRouter();
  const lines = useMemo(
    () => [
      "there is no reward.",
      "this will not unlock anything.",
      "you can stop looking now.",
      "it was never hidden. you just insisted.",
      "you did it for nothing. (good.)",
      "the secret is that there is no secret.",
    ],
    []
  );

  const [i, setI] = useState(0);
  const [countdown, setCountdown] = useState(12);

  useEffect(() => {
    // Guard: only allow if opened via easter egg trigger (sessionStorage flag)
    let ok = false;
    try {
      ok = window.sessionStorage.getItem("found_secret") === "1";
    } catch {}

    if (!ok) {
      router.replace("/");
      return;
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        setI((prev) => (prev + 1) % lines.length);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    // Self-destruct: send them back after a short countdown
    const interval = window.setInterval(() => {
      setCountdown((c) => {
        const next = c - 1;
        if (next <= 0) {
          try {
            window.sessionStorage.removeItem("found_secret");
            window.sessionStorage.removeItem("found_secret_at");
          } catch {}
          router.replace("/");
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(interval);
    };
  }, [router, lines.length]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-semibold">you found it</h1>

        <div className="rounded-2xl border border-black/10 bg-white/60 p-5 text-left shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm text-neutral-700 dark:text-neutral-200">{lines[i]}</p>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            switch tabs and come back. it changes its mind.
          </p>
          <p className="mt-3 text-[11px] text-neutral-400 dark:text-neutral-500">
            this page will disappear in {countdown}s.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block text-sm text-neutral-400 hover:text-neutral-900 transition"
          onClick={() => {
            try {
              window.sessionStorage.removeItem("found_secret");
              window.sessionStorage.removeItem("found_secret_at");
            } catch {}
          }}
        >
          ← back to home
        </Link>
      </div>
    </main>
  );
}