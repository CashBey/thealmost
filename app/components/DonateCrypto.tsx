"use client";

import { useEffect, useMemo, useState } from "react";
import * as QRCode from "qrcode";

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

    const list = [
      { key: "BTC", label: "BTC", address: btc },
      { key: "ETH", label: "ETH", address: eth },
      { key: "USDT", label: "USDT (TRC20)", address: usdt },
    ] satisfies Coin[];

    return list.filter((c) => c.address.trim().length > 0);
  }, []);

  const [open, setOpen] = useState(!compact);
  const [active, setActive] = useState(0);
  const [qr, setQr] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const coin = coins[active];

  useEffect(() => {
    let cancelled = false;

    async function gen() {
      setQr("");
      setCopied(false);

      if (!coin?.address) return;

      try {
        const dataUrl = await QRCode.toDataURL(coin.address, {
          margin: 1,
          width: 220,
        });
        if (!cancelled) setQr(dataUrl);
      } catch {
        if (!cancelled) setQr("");
      }
    }

    gen();
    return () => {
      cancelled = true;
    };
  }, [coin?.address]);

  async function copyAddress() {
    if (!coin?.address) return;
    try {
      await navigator.clipboard.writeText(coin.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  // Eğer env’ler boşsa component hiç göstermeyelim
  if (coins.length === 0) return null;

  const Card = (
    <div className="w-full max-w-xl rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium">Donate</div>
          <div className="mt-1 text-xs opacity-60">
            crypto donations (no perks, no tiers)
          </div>
        </div>

        {compact && (
          <button
            onClick={() => setOpen(false)}
            className="rounded-xl border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5"
            aria-label="Close"
          >
            Close
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {coins.map((c, i) => {
          const isActive = i === active;
          return (
            <button
              key={c.key}
              onClick={() => setActive(i)}
              className={[
                "rounded-xl border px-3 py-2 text-xs transition",
                isActive
                  ? "border-black/20 bg-black text-white"
                  : "border-black/10 hover:bg-black/5",
              ].join(" ")}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_240px]">
        <div>
          <div className="text-xs opacity-60">Address</div>

          <div className="mt-2 rounded-2xl border border-black/10 bg-black/5 p-3">
            <div className="select-all break-all font-mono text-xs leading-relaxed">
              {coin?.address || ""}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={copyAddress}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs hover:bg-black/5"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>

            <a
              href={
                coin?.key === "BTC"
                  ? `bitcoin:${coin.address}`
                  : coin?.key === "ETH"
                    ? `ethereum:${coin.address}`
                    : "#"
              }
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs hover:bg-black/5"
              onClick={(e) => {
                // USDT için universal deep-link yok; boşsa engelle
                if (coin?.key === "USDT") e.preventDefault();
              }}
            >
              Open in wallet
            </a>
          </div>

          <div className="mt-3 text-[11px] opacity-50">
            Please double-check network and address before sending.
          </div>
        </div>

        <div className="flex items-center justify-center">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qr}
              alt={`${coin?.label} QR`}
              className="h-[220px] w-[220px] rounded-2xl border border-black/10 bg-white p-2"
            />
          ) : (
            <div className="flex h-[220px] w-[220px] items-center justify-center rounded-2xl border border-black/10 bg-black/5 text-xs opacity-60">
              QR loading…
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!compact) {
    return <div className="w-full">{Card}</div>;
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm shadow-sm hover:bg-black/5"
        >
          Donate
        </button>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/40"
            aria-label="Close overlay"
            onClick={() => setOpen(false)}
          />
          <div className="relative">{Card}</div>
        </div>
      )}
    </div>
  );
}
