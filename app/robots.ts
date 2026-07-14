import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://www.eliteroute.mx";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/success", "/cancel"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
