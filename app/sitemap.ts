import type { MetadataRoute } from "next";
import { BRANDS } from "./lib/producten/brands";
import { PRODUCTS } from "./lib/producten/products";

const BASE_URL = "https://climate-x-alpha.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const statisch: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, priority: 1, changeFrequency: "weekly" },
    { url: `${BASE_URL}/producten`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE_URL}/calculator`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/diensten`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/projecten`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/over-ons`, priority: 0.5, changeFrequency: "yearly" },
    { url: `${BASE_URL}/waarom-climatex`, priority: 0.5, changeFrequency: "yearly" },
  ];

  const merken: MetadataRoute.Sitemap = BRANDS.map((b) => ({
    url: `${BASE_URL}/producten/${b.slug}`,
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  const producten: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${BASE_URL}/producten/${p.merkSlug}/${p.productSlug}`,
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  return [...statisch, ...merken, ...producten];
}
