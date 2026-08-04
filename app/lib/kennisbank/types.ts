/**
 * Datamodel voor de kennisbank.
 *
 * Regel voor deze module: elke feitelijke bewering over subsidies, bedragen,
 * termijnen of regelgeving moet herleidbaar zijn tot een officiële bron in
 * `bronnen`. Staat een bewering niet in een bron, dan hoort die hier niet.
 */

export type ArtikelCategorie = "Techniek" | "Kiezen" | "Subsidie & regels" | "Zakelijk & VvE";

export interface Bron {
  titel: string;
  organisatie: string;
  url: string;
}

/** Een tekstblok binnen een artikel. */
export type Blok =
  | { type: "alinea"; tekst: string }
  | { type: "lijst"; items: string[] }
  | { type: "kader"; titel: string; tekst: string };

export interface Sectie {
  kop: string;
  blokken: Blok[];
}

export interface Artikel {
  slug: string;
  titel: string;
  categorie: ArtikelCategorie;
  samenvatting: string;
  /** Leestijd in minuten, afgerond. */
  leestijd: number;
  secties: Sectie[];
  faqs: { vraag: string; antwoord: string }[];
  bronnen: Bron[];
  /**
   * Datum waarop de inhoud voor het laatst tegen de bronnen is gecontroleerd.
   * Relevant bij subsidies en regelgeving, die periodiek wijzigen.
   */
  gecontroleerdOp: string;
  gerelateerd: string[];
}
