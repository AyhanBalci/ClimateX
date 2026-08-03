// Centraal datamodel voor de laadpaal-productcatalogus (/producten).
// Volledig statisch en losstaand van de Supabase "producten"-tabel die het
// CRM (leads, werkbonnen, klantenportaal) gebruikt — bewust niet aangeraakt.

export type Fase = "1-fase" | "3-fase" | "1- of 3-fase";
export type Kabeltype = "vast" | "los" | "vast of los";
export type Connectiviteit = "wifi" | "bluetooth" | "4g" | "ethernet";
export type Doelgroep = "particulier" | "zakelijk" | "vve";
export type ImageVariant = "hero" | "angle" | "front" | "side" | "detail" | "installed";

export interface ProductSpecs {
  vermogenKw: number; // hoogste laadvermogen, voor sortering/filtering
  vermogenLabel: string; // weergavetekst, bv. "22 kW (3-fase) / 7,4 kW (1-fase)"
  fase: Fase;
  kabel: Kabeltype;
  kabellengteM: number | null; // null = niet van toepassing (los/type 2 stopcontact)
  rfid: boolean;
  loadBalancing: boolean;
  dynamicLoadBalancing: boolean;
  midMeter: boolean;
  app: boolean;
  connectiviteit: Connectiviteit[];
  garantieJaren: number;
  garantieLabel: string;
  installatietijd: string; // bv. "3 - 4 uur"
  installatieInbegrepen: boolean;
  beschermingsgraad: string;
  afmetingen: string;
}

export interface FaqItem {
  vraag: string;
  antwoord: string;
}

export type DownloadType = "datasheet" | "handleiding" | "installatie" | "garantie";

export interface DownloadItem {
  label: string;
  type: DownloadType;
  bestand: string; // bestandsnaam, placeholder tot echte PDF's beschikbaar zijn
}

export interface Product {
  merkSlug: string;
  productSlug: string; // uniek binnen het merk, gebruikt in /producten/[merk]/[product]
  model: string;
  tagline: string;
  beschrijving: string;
  voordelen: string[];
  specs: ProductSpecs;
  vanafPrijs: number;
  geschiktVoor: Doelgroep[];
  faqs: FaqItem[];
  downloads: DownloadItem[];
  gerelateerd: string[]; // productSlugs, mogen van andere merken zijn
  badges: string[]; // bv. "Bestseller", "Beste prijs-kwaliteit"
  /** Extensie van de placeholder-/productfoto's. Zet op "webp" zodra de
   *  echte foto's met dezelfde bestandsnamen zijn geplaatst — verder is
   *  geen codewijziging nodig. */
  imageExt: string;
}

export interface Brand {
  slug: string;
  naam: string;
  monogram: string;
  accentHex: string; // basis voor placeholder-afbeeldingen en merkaccent
  beschrijving: string;
  langeBeschrijving: string;
  garantie: string;
  levertijd: string;
  voordelen: string[];
}

export interface ProductWithBrand extends Product {
  brand: Brand;
}
