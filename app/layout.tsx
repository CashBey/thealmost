import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeToggle from "./components/ThemeToggle";
import RandomOddOverlay from "./components/RandomOddOverlay";
import OddInteractionsProvider from "./components/OddInteractionsProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "odd fun",
  description: "a place for odd little experiments",
  openGraph: {
    images: [
      {
        url: "https://bolt.new/static/og_default.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "https://bolt.new/static/og_default.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OddInteractionsProvider>
          <ThemeToggle />
          <RandomOddOverlay />
          {children}
        </OddInteractionsProvider>
      </body>
    </html>
  );
}
