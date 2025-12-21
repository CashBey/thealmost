import type { MetadataRoute } from "next";
import { ACTIVE_EXPERIMENTS } from "../lib/experiments";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://thealmost.fun";

  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/experiments`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/why`, lastModified: new Date() },
    { url: `${base}/donate`, lastModified: new Date() },
    ...ACTIVE_EXPERIMENTS.map((e) => ({
      url: `${base}${e.href}`,
      lastModified: new Date(),
    })),
  ];
}
