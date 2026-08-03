import { Brand } from "./types";

export const BRANDS: Brand[] = [
  {
    slug: "alfen",
    naam: "Alfen",
    monogram: "AF",
    accentHex: "#4FC3F0",
    beschrijving: "Nederlandse kwaliteit met een uitstekende reputatie in betrouwbaarheid.",
    langeBeschrijving:
      "Alfen is een Nederlandse fabrikant van laadinfrastructuur, genoteerd aan Euronext Amsterdam. De Eve-serie staat bekend om zijn robuuste bouw, MID-gecertificeerde meters, uitgebreide OCPP-ondersteuning en soepele integratie met energiemanagementsystemen — de veilige keuze voor thuis en op de zaak.",
    garantie: "2 jaar fabrieksgarantie",
    levertijd: "1 – 2 weken",
    voordelen: ["Robuust en betrouwbaar", "Uitstekende app-ondersteuning", "Geschikt voor uitbreiding"],
  },
  {
    slug: "ratio",
    naam: "Ratio",
    monogram: "RT",
    accentHex: "#F2A93B",
    beschrijving: "Made in Holland: laadpalen van Ratio Electric uit Nijkerk.",
    langeBeschrijving:
      "Ratio Electric ontwikkelt en bouwt zijn laadpalen volledig in Nederland (Nijkerk), met meer dan 15 jaar ervaring in laadoplossingen. Van de eenvoudige Plug & Charge-instapper tot solar laden en MID-gecertificeerde zakelijke modellen — degelijke techniek met een scherpe prijs.",
    garantie: "3 jaar garantie (verlengbaar tot 5 jaar)",
    levertijd: "1 – 2 weken",
    voordelen: ["Made in Holland", "Solar laden via Sensorbox", "Scherpe prijs-kwaliteitverhouding"],
  },
  {
    slug: "easee",
    naam: "Easee",
    monogram: "ES",
    accentHex: "#34D399",
    beschrijving: "Slim en flexibel, met dynamic load balancing voor optimaal gebruik.",
    langeBeschrijving:
      "Easee is een Noors merk dat laadpalen radicaal simpel en licht heeft gemaakt. De huidige Charge-serie (Up, Max, Core) heeft load- en fasebalancering, RFID en 4G ingebouwd, wordt via de cloud automatisch bijgewerkt en komt standaard met 5 jaar garantie.",
    garantie: "5 jaar fabrieksgarantie",
    levertijd: "1 – 2 weken",
    voordelen: ["Dynamic load balancing standaard", "Modulair uit te breiden", "Geschikt voor thuis én zakelijk"],
  },
  {
    slug: "wallbox",
    naam: "Wallbox",
    monogram: "WB",
    accentHex: "#F0555A",
    beschrijving: "Compacte en betaalbare laadpalen met een sterke smartphone-app.",
    langeBeschrijving:
      "Wallbox is een Spaans merk dat wereldwijd bekend staat om zijn compacte, designgerichte laadpalen. Met functies als Power Boost — dat piekbelasting op uw meterkast voorkomt — en een van de best beoordeelde apps in de markt is Wallbox een uitstekende prijs-kwaliteitkeuze.",
    garantie: "3 jaar fabrieksgarantie",
    levertijd: "1 week",
    voordelen: ["Zeer compact design", "Scherp geprijsd", "Intuïtieve app"],
  },
  {
    slug: "zaptec",
    naam: "Zaptec",
    monogram: "ZT",
    accentHex: "#8B7CF6",
    beschrijving: "Scandinavisch design met ingebouwde load balancing als standaard.",
    langeBeschrijving:
      "Zaptec is een Noorse fabrikant met een van de langste garantietermijnen in de markt. Het minimalistische design combineert met geavanceerde laadtechnologie: ingebouwde load balancing, automatische cloud-updates en een laadpaal die meegroeit met uw wagenpark.",
    garantie: "5 jaar fabrieksgarantie",
    levertijd: "1 – 2 weken",
    voordelen: ["Load balancing standaard", "Compact en stijlvol", "5 jaar garantie — beste in class"],
  },
];

export function getBrand(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug.toLowerCase());
}
