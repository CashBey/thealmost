"use client";

import { useMemo, useState } from "react";
import QRCode from "qrcode";

type Coin = {
  key: "BTC" | "ETH" | "USDT";
  label: string;
  address: string;
};

export default function DonateCrypto({ compact = false }: { compact?: boolean }) {
  const coins = useMemo(() => {
  const btc = process.env.NEXT_PUBLIC_DONATE_BTC || "";
  const eth = process.env.NEXT_PUBLIC_DONATE_ETH || "";
  const usdt = process.env.NEXT_PUBLIC_DONATE_USDT_TRC20 || "";

  return [
    { key: "BTC", label: "BTC", address: btc },
    { key: "ETH", label: "ETH", address: eth },
    { key: "USDT", label: "USDT (TRC20)", address: usdt },
  ] satisfies Coin[];
}, []);


    return [
      { key: "BTC", label: "BTC", address: btc },
      { key: "ETH", label: "ETH", address: eth },
      { key: "USDT", label: "USDT (TRC20)", address: usdt },
    ].filter((c) => c.address.trim().length > 0);
  }, []);

  const [open, setOpen] = useState(!compact);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  if (coins.length === 0) return null;
  const coin = coins[Math.min(active, coins.length - 1)];

  async function copyAddr() {
    try {
      await navigator.clipboard.writeText(coin.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  async function generateQR() {
    try {
      const dataUrl = await QRCode.toDataURL(coin.address, {
        width: 180,
        margin: 1,
      });
      setQr(dataUrl);
    } catch {}
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
      {compact && (
        <button
          className="odd-interactive w-full text-left text-sm font-medium opacity-80 hover:opacity-100 transition"
          onClick={() => setOpen((v) => !v)}
        >
          donate (crypto){open ? "" : " →"}
        </button>
      )}

      {open && (
        <div className={compact ? "mt-3" : ""}>
          <div className="flex flex-wrap gap-2">
            {coins.map((c, i) => (
              <button
                key={c.key}
                onClick={() => {
                  setActive(i);
                  setQr(null);
                }}
                className={[
                  "odd-interactive rounded-full px-3 py-1 text-xs border transition",
                  "border-black/10 dark:border-white/10",
                  i === active
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-white/60 dark:bg-white/5",
                ].join(" ")}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <div className="text-xs opacity-60">address</div>
            <div className="mt-1 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-3 font-mono text-xs break-all">
              {coin.address}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={copyAddr}
                className="odd-interactive rounded-full bg-black px-4 py-2 text-xs font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
              >
                {copied ? "copied" : "copy"}
              </button>

              <button
                onClick={generateQR}
                className="odd-interactive rounded-full border border-black/10 px-4 py-2 text-xs dark:border-white/10"
              >
                show QR
              </button>
            </div>

            {qr && (
              <div className="mt-4 flex justify-center">
                <img src={qr} alt="QR code" className="rounded-lg" />
              </div>
            )}

            <div className="mt-3 text-xs opacity-50">
              thank you. no perks. no tiers.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

