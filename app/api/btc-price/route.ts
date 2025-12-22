import { NextResponse } from "next/server";

export const revalidate = 60; // seconds

type CoinGeckoResponse = {
  bitcoin?: {
    usd?: number;
  };
};

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      {
        // Next.js will cache on the server; revalidate above controls freshness
        next: { revalidate },
        headers: {
          "accept": "application/json",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "price_fetch_failed" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as CoinGeckoResponse;
    const usd = data?.bitcoin?.usd;

    if (typeof usd !== "number" || !Number.isFinite(usd) || usd <= 0) {
      return NextResponse.json(
        { ok: false, error: "invalid_price" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { ok: true, btcUsd: usd, source: "coingecko", ts: Date.now() },
      {
        status: 200,
        headers: {
          // extra cache for edge/proxy; still revalidated server-side
          "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "unexpected_error" },
      { status: 502 }
    );
  }
}
