import { Brand, Product } from "./producten/types";
import { productDisplayName } from "./producten/helpers";

export const SITE_URL = "https://climate-x-alpha.vercel.app";
export const SITE_NAME = "ClimateX";
export const SITE_TELEFOON = "+31614004488";
export const SITE_EMAIL = "contact@climatex.nl";

export function absoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Serialiseert JSON-LD veilig voor gebruik in een <script>-tag.
 * `<` wordt ge-escaped zodat een `</script>` in de data de tag niet kan afsluiten
 * (XSS-injectie), conform de Next.js-documentatie over JSON-LD.
 */
export function serialiseerJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

type JsonLdObject = Record<string, unknown>;

/** Organisatiegegevens van ClimateX — site-breed, alleen gepubliceerde bedrijfsgegevens. */
export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organisatie`,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "ClimateX installeert premium laadpalen voor woningen, bedrijven en VvE's in Nederland, inclusief load balancing en dynamic load balancing.",
    telephone: SITE_TELEFOON,
    email: SITE_EMAIL,
    areaServed: {
      "@type": "Country",
      name: "Nederland",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE_TELEFOON,
      email: SITE_EMAIL,
      contactType: "customer service",
      availableLanguage: ["nl"],
    },
  };
}

/** De website zelf, zodat zoekmachines site-naam en taal correct oppikken. */
export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "nl-NL",
    publisher: { "@id": `${SITE_URL}/#organisatie` },
  };
}

export interface Kruimel {
  naam: string;
  pad: string;
}

export function breadcrumbJsonLd(kruimels: Kruimel[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: kruimels.map((kruimel, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: kruimel.naam,
      item: absoluteUrl(kruimel.pad),
    })),
  };
}

export function faqJsonLd(faqs: { vraag: string; antwoord: string }[]): JsonLdObject | null {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.vraag,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.antwoord,
      },
    })),
  };
}

/** Formaten die Google accepteert voor afbeeldingen in structured data (SVG niet). */
const ONDERSTEUNDE_AFBEELDINGEN = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"];

function bruikbareAfbeeldingen(paden: string[]): string[] {
  return paden.filter((pad) => ONDERSTEUNDE_AFBEELDINGEN.some((ext) => pad.toLowerCase().endsWith(ext)));
}

/**
 * Productgegevens voor rich results. Bewust zonder `aggregateRating` of `review`:
 * daarvoor ontbreken geverifieerde beoordelingen per product, en gemarkeerde
 * beoordelingen zonder onderbouwing zijn in strijd met het beleid van Google.
 *
 * Zolang de productfoto's placeholders in SVG zijn, wordt `image` weggelaten:
 * Google ondersteunt SVG niet en een ongeldige afbeelding kan het volledige
 * rich result afkeuren. Zodra er echte foto's staan verschijnt het veld vanzelf.
 */
export function productJsonLd(product: Product, brand: Brand, afbeeldingen: string[]): JsonLdObject {
  const naam = productDisplayName(product);
  const eigenschappen: JsonLdObject[] = [
    { "@type": "PropertyValue", name: "Laadvermogen", value: product.specs.vermogenLabel },
    { "@type": "PropertyValue", name: "Aansluiting", value: product.specs.fase },
    { "@type": "PropertyValue", name: "RFID", value: product.specs.rfid ? "Ja" : "Nee" },
    { "@type": "PropertyValue", name: "Load balancing", value: product.specs.loadBalancing ? "Ja" : "Nee" },
    {
      "@type": "PropertyValue",
      name: "Dynamic load balancing",
      value: product.specs.dynamicLoadBalancing ? "Ja" : "Nee",
    },
    { "@type": "PropertyValue", name: "MID-meter", value: product.specs.midMeter ? "Ja" : "Nee" },
    { "@type": "PropertyValue", name: "Beschermingsgraad", value: product.specs.beschermingsgraad },
  ];

  const bruikbaar = bruikbareAfbeeldingen(afbeeldingen);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: naam,
    description: product.beschrijving,
    ...(bruikbaar.length > 0 ? { image: bruikbaar.map(absoluteUrl) } : {}),
    category: "Laadpaal",
    brand: {
      "@type": "Brand",
      name: brand.naam,
    },
    additionalProperty: eigenschappen,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: product.vanafPrijs,
      offerCount: 1,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/producten/${product.merkSlug}/${product.productSlug}`),
      seller: { "@id": `${SITE_URL}/#organisatie` },
    },
  };
}

/**
 * Kennisbankartikel. `dateModified` gebruikt de datum waarop de inhoud voor het
 * laatst tegen de officiële bronnen is gecontroleerd — voor subsidie- en
 * regelgevingsinformatie is dat het meest betekenisvolle signaal.
 */
export function artikelJsonLd(artikel: {
  slug: string;
  titel: string;
  samenvatting: string;
  gecontroleerdOp: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: artikel.titel,
    description: artikel.samenvatting,
    dateModified: artikel.gecontroleerdOp,
    inLanguage: "nl-NL",
    mainEntityOfPage: absoluteUrl(`/kennisbank/${artikel.slug}`),
    author: { "@id": `${SITE_URL}/#organisatie` },
    publisher: { "@id": `${SITE_URL}/#organisatie` },
  };
}

/** Installatiedienst als los aanbod, voor de dienstenpagina. */
export function serviceJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Laadpaal installatie",
    serviceType: "Installatie van laadpalen",
    provider: { "@id": `${SITE_URL}/#organisatie` },
    areaServed: { "@type": "Country", name: "Nederland" },
    description:
      "Installatie van laadpalen voor thuis, zakelijk en VvE door NEN 1010 gecertificeerde monteurs, inclusief meterkastbeoordeling en oplevering met testrapport.",
  };
}
