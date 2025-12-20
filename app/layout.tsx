import "./globals.css";
import type { Metadata } from "next";
import ThemeToggle from "./components/ThemeToggle";
import RandomOddOverlay from "./components/RandomOddOverlay";
import OddInteractionsProvider from "./components/OddInteractionsProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://thealmost.fun"),
  title: {
    default: "thealmost",
    template: "%s · thealmost",
  },
  description: "a place for odd little experiments",
  openGraph: {
    title: "thealmost",
    description: "a place for odd little experiments",
    url: "https://thealmost.fun",
    siteName: "thealmost",
    images: [{ url: "/opengraph-image" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <OddInteractionsProvider>
          <ThemeToggle />
          <RandomOddOverlay />
          {children}
        </OddInteractionsProvider>
      </body>
    </html>
  );
}
