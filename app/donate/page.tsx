import Link from "next/link";
import DonateCrypto from "../components/DonateCrypto";

export const metadata = {
  title: "Donate — thealmost",
  description: "Crypto donation addresses (BTC, ETH, USDT TRC20).",
};

export default function DonatePage() {
  return (
    <div className="min-h-screen px-6 py-16 flex justify-center">
      <div className="max-w-2xl w-full space-y-10">
        <header className="space-y-3">
          <h1 className="text-2xl font-medium">Donate</h1>
          <p className="text-sm opacity-70">
            If you enjoyed the experiments and want to support more odd little builds.
          </p>
          <div className="text-xs opacity-60">
            <Link className="underline" href="/">back home</Link>
          </div>
        </header>

        <DonateCrypto />

        <div className="text-[11px] opacity-45">
          Notes: crypto transfers are irreversible. Send a small test amount first if you’re unsure.
        </div>
      </div>
    </div>
  );
}
