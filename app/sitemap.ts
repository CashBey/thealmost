import type { MetadataRoute } from "next";
import { ACTIVE_EXPERIMENTS } from "../lib/experiments";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://thealmost.fun";

  return [
    { url: `${base}/`, lastModified: new Date() },
    ...ACTIVE_EXPERIMENTS.map((e) => ({
      url: `${base}${e.href}`,
      lastModified: new Date(),
    })),
  ];
}
