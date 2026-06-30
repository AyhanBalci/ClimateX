export type LaadpaalMerkInfo = {
  merk: string;
  monogram: string;
  beschrijving: string;
  garantie: string;
  levertijd: string;
  voordelen: string[];
};

export const LAADPAAL_MERKEN: LaadpaalMerkInfo[] = [
  {
    merk: "Alfen",
    monogram: "AF",
    beschrijving: "Nederlandse kwaliteit met een uitstekende reputatie in betrouwbaarheid.",
    garantie: "3 jaar fabrieksgarantie",
    levertijd: "1 – 2 weken",
    voordelen: ["Robuust en betrouwbaar", "Uitstekende app-ondersteuning", "Geschikt voor uitbreiding"],
  },
  {
    merk: "Zaptec",
    monogram: "ZT",
    beschrijving: "Scandinavisch design met ingebouwde load balancing als standaard.",
    garantie: "5 jaar fabrieksgarantie",
    levertijd: "1 – 2 weken",
    voordelen: ["Load balancing standaard", "Compact en stijlvol", "Eenvoudig uit te breiden"],
  },
  {
    merk: "Wallbox",
    monogram: "WB",
    beschrijving: "Compacte en betaalbare laadpaal met sterke smartphone-app.",
    garantie: "3 jaar fabrieksgarantie",
    levertijd: "1 week",
    voordelen: ["Zeer compact", "Scherp geprijsd", "Intuïtieve app"],
  },
  {
    merk: "Easee",
    monogram: "ES",
    beschrijving: "Slim en flexibel, met dynamic load balancing voor optimaal gebruik.",
    garantie: "5 jaar fabrieksgarantie",
    levertijd: "1 – 2 weken",
    voordelen: ["Dynamic load balancing", "Modulair uit te breiden", "Geschikt voor thuis én zakelijk"],
  },
  {
    merk: "ABB",
    monogram: "AB",
    beschrijving: "Industriële betrouwbaarheid voor zware, zakelijke toepassingen.",
    garantie: "2 jaar fabrieksgarantie",
    levertijd: "2 – 3 weken",
    voordelen: ["Zeer robuust", "Geschikt voor wagenparken", "Uitgebreide toegangscontrole"],
  },
  {
    merk: "EVBox",
    monogram: "EV",
    beschrijving: "Veelzijdige laadoplossing, populair bij VvE's en bedrijven.",
    garantie: "3 jaar fabrieksgarantie",
    levertijd: "2 – 3 weken",
    voordelen: ["Geschikt voor VvE's", "Dynamic load balancing", "Bewezen schaalbaarheid"],
  },
  {
    merk: "Smappee",
    monogram: "SM",
    beschrijving: "Geavanceerd energiemanagement voor zakelijke laadlocaties.",
    garantie: "2 jaar fabrieksgarantie",
    levertijd: "2 – 3 weken",
    voordelen: ["Slim energiemanagement", "Meerdere laadpunten aansturen", "Inzicht in verbruik"],
  },
];

export function getMerkInfo(merk: string): LaadpaalMerkInfo | undefined {
  return LAADPAAL_MERKEN.find((m) => m.merk.toLowerCase() === merk.toLowerCase());
}
