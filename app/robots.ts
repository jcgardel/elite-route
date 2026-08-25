import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://www.eliteroute.mx";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // El idioma va en la ruta desde que existen /en y /es.
      disallow: ["/api/", "/en/success", "/es/success", "/en/cancel", "/es/cancel"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
