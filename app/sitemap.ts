import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://www.eliteroute.mx";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tarifas`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/b2b`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/b2b/cotizar`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
