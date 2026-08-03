import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/portal", "/agents", "/api"],
      },
    ],
    sitemap: "https://climate-x-alpha.vercel.app/sitemap.xml",
  };
}
