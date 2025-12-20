import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  // Minimal, logo-forward OG card. No external font fetches.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 28,
          }}
        >
          <div
            style={{
              width: 128,
              height: 128,
              borderRadius: 32,
              border: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2 }}>ta</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2 }}>thealmost</div>
            <div style={{ fontSize: 24, opacity: 0.65 }}>odd little experiments</div>
            <div style={{ fontSize: 18, opacity: 0.45 }}>thealmost.fun</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
