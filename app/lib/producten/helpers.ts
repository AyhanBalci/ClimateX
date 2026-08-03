import { BRANDS, getBrand } from "./brands";
import { PRODUCTS } from "./products";
import { Doelgroep, ImageVariant, Product, ProductWithBrand } from "./types";

export function withBrand(product: Product): ProductWithBrand {
  const brand = getBrand(product.merkSlug);
  if (!brand) {
    throw new Error(`Onbekend merk voor product ${product.merkSlug}/${product.productSlug}`);
  }
  return { ...product, brand };
}

export const ALL_PRODUCTS: ProductWithBrand[] = PRODUCTS.map(withBrand);

export function productImagePath(product: Product, variant: ImageVariant): string {
  return `/images/products/${product.merkSlug}/${product.productSlug}/${variant}.${product.imageExt}`;
}

export function productHref(product: Product): string {
  return `/producten/${product.merkSlug}/${product.productSlug}`;
}

/** Volledige productnaam zonder merk-duplicatie (bv. "Easee One", niet "Easee Easee One"). */
export function productDisplayName(product: Product): string {
  const brand = getBrand(product.merkSlug);
  const merkNaam = brand?.naam ?? product.merkSlug;
  return product.model.toLowerCase().startsWith(merkNaam.toLowerCase()) ? product.model : `${merkNaam} ${product.model}`;
}

export function formatPrijs(waarde: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(waarde);
}

export interface ProductFilters {
  merken?: string[];
  minVermogen?: number;
  fase?: ("1-fase" | "3-fase")[];
  kabel?: ("vast" | "los")[];
  rfid?: boolean;
  midMeter?: boolean;
  loadBalancing?: boolean;
  dynamicLoadBalancing?: boolean;
  maxPrijs?: number;
  doelgroep?: Doelgroep[];
  zoekterm?: string;
}

function matchesFase(productFase: Product["specs"]["fase"], gewenst: ("1-fase" | "3-fase")[]): boolean {
  if (gewenst.length === 0) return true;
  return gewenst.some((f) => productFase === f || productFase === "1- of 3-fase");
}

function matchesKabel(productKabel: Product["specs"]["kabel"], gewenst: ("vast" | "los")[]): boolean {
  if (gewenst.length === 0) return true;
  return gewenst.some((k) => productKabel === k || productKabel === "vast of los");
}

export function filterProducts(products: ProductWithBrand[], filters: ProductFilters): ProductWithBrand[] {
  const zoek = filters.zoekterm?.trim().toLowerCase() ?? "";

  return products.filter((p) => {
    if (filters.merken && filters.merken.length > 0 && !filters.merken.includes(p.merkSlug)) return false;
    if (filters.minVermogen && p.specs.vermogenKw < filters.minVermogen) return false;
    if (filters.fase && !matchesFase(p.specs.fase, filters.fase)) return false;
    if (filters.kabel && !matchesKabel(p.specs.kabel, filters.kabel)) return false;
    if (filters.rfid && !p.specs.rfid) return false;
    if (filters.midMeter && !p.specs.midMeter) return false;
    if (filters.loadBalancing && !p.specs.loadBalancing) return false;
    if (filters.dynamicLoadBalancing && !p.specs.dynamicLoadBalancing) return false;
    if (filters.maxPrijs && p.vanafPrijs > filters.maxPrijs) return false;
    if (filters.doelgroep && filters.doelgroep.length > 0 && !filters.doelgroep.some((d) => p.geschiktVoor.includes(d))) return false;
    if (zoek) {
      const haystack = `${p.brand.naam} ${p.model} ${p.tagline}`.toLowerCase();
      if (!haystack.includes(zoek)) return false;
    }
    return true;
  });
}

export function getRelatedProducts(product: Product, limit = 3): ProductWithBrand[] {
  const related = product.gerelateerd
    .map((ref) => ALL_PRODUCTS.find((p) => `${p.merkSlug}/${p.productSlug}` === ref))
    .filter((p): p is ProductWithBrand => Boolean(p));
  return related.slice(0, limit);
}

export const PRICE_RANGE = {
  min: Math.min(...PRODUCTS.map((p) => p.vanafPrijs)),
  max: Math.max(...PRODUCTS.map((p) => p.vanafPrijs)),
};

export const VERMOGEN_OPTIES = [3.7, 7.4, 11, 22] as const;

export function brandCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const b of BRANDS) counts[b.slug] = getProductsForBrandCount(b.slug);
  return counts;
}

function getProductsForBrandCount(merkSlug: string): number {
  return PRODUCTS.filter((p) => p.merkSlug === merkSlug).length;
}
