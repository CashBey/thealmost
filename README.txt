PATCH CONTENTS
- app/api/btc-price/route.ts : server-side BTC->USD fetch (CoinGecko), cached
- app/spend-satoshi/page.tsx : redesigned Spend Satoshi (Satoshi holdings simulation + philosophy)
- app/spend-satoshi/metadata.ts

INSTALL
1) Copy the 'app/' folder into your repo (overwrite files).
2) Commit + push.

NOTES
- Requires your existing CopyLink component at app/components/CopyLink.tsx
- Uses Next.js Route Handlers (App Router). Works on Next 13.4+.
