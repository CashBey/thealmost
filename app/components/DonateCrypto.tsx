"use client";

import { useMemo, useState } from "react";

type CoinKey = "BTC" | "ETH" | "USDT";

type Coin = {
  key: CoinKey;
  label: string;
  address: string;
  note?: string;
};

function qrUrl(data: string) {
  // Lightweight QR without extra deps (avoids qrcode/@types issues)
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(data)}`;
}

function short(addr: string) {
  if (!addr) return "";
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

export default function DonateCrypto({ compact = false }: { compact?: boolean }) {
  const coins = useMemo<Coin[]>(
    () => [
      {
        key: "BTC",
        label: "Bitcoin (BTC)",
        address: "bc1qt32v87pqnlvq8kdvm6dw97k3f797gg55p7kafv",
      },
      {
        key: "ETH",
        label: "Ethereum (ETH)",
        address: "0x87e15ba95bff7d256148fd7338e6bf44c1e3d819",
      },
      {
        key: "USDT",
        label: "USDT (TRC20)",
        address: "TEAoiZda7Js8bmEjgiPCJrAGwkkKoCe43P",
        note: "Network: TRON (TRC20)",
      },
    ],
    []
  );

  const [active, setActive] = useState<CoinKey>("BTC");
  const coin = coins.find((c) => c.key === active) ?? coins[0];

  async function copy() {
    try {
      await navigator.clipboard.writeText(coin.address);
    } catch {
      // ignore
    }
  }

  return (
    <div className={"rounded-2xl border border-black/10 dark:border-white/10 " + (compact ? "p-4" : "p-5")}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">Donate</div>
        <div className="flex items-center gap-2 text-xs">
          {coins.map((c) => (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={
                "px-2 py-1 rounded-lg border transition " +
                (active === c.key
                  ? "border-black/20 dark:border-white/20 opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100")
              }
              type="button"
            >
              {c.key}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 text-xs opacity-70">{coin.label}</div>
      {coin.note && <div className="mt-1 text-[11px] opacity-50">{coin.note}</div>}

      {!compact && (
        <div className="mt-4 flex flex-col sm:flex-row gap-4 items-start">
          <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-black">
            {/* QR is a remote image; simple + reliable */}
            <img src={qrUrl(coin.address)} alt={`${coin.key} QR`} width={220} height={220} />
          </div>

          <div className="flex-1 space-y-3">
            <div className="text-xs opacity-60">Address</div>
            <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
              <div className="font-mono text-xs break-all">{coin.address}</div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={copy}
                className="odd-interactive underline opacity-70 hover:opacity-100 transition"
              >
                copy
              </button>
              <span className="opacity-40">{short(coin.address)}</span>
            </div>

            <div className="text-[11px] opacity-45">
              Double-check the network before sending.
            </div>
          </div>
        </div>
      )}

      {compact && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="font-mono text-xs opacity-70">{short(coin.address)}</div>
          <button
            type="button"
            onClick={copy}
            className="odd-interactive text-xs underline opacity-60 hover:opacity-100 transition"
          >
            copy
          </button>
        </div>
      )}
    </div>
  );
}
