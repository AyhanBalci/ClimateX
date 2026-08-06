/**
 * Regels rond bestandsuploads.
 *
 * De uploadknop accepteerde tot nu toe elk bestand van elke omvang. Een klant
 * die per ongeluk een video van 400 MB koos, vulde daarmee de opslag; een
 * uitvoerbaar bestand kwam er net zo makkelijk in. Deze regels staan los van de
 * component zodat ze te controleren zijn zonder browser.
 */

/** Grens per bestand. Ruim genoeg voor foto's van een telefoon en scans. */
export const MAX_BESTANDSGROOTTE_MB = 15;
const MAX_BESTANDSGROOTTE_BYTES = MAX_BESTANDSGROOTTE_MB * 1024 * 1024;

/**
 * Toegestane bestandstypen: foto's van de installatie, PDF's zoals offertes en
 * keuringsrapporten, en de gangbare kantoorformaten.
 */
export const TOEGESTANE_MIMETYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

/** Waarde voor het accept-attribuut van het invoerveld. */
export const ACCEPT_ATTRIBUUT = TOEGESTANE_MIMETYPES.join(",");

export type BestandControle = { toegestaan: true } | { toegestaan: false; reden: string };

export function controleerBestand(bestand: { name: string; size: number; type: string }): BestandControle {
  if (bestand.size === 0) {
    return { toegestaan: false, reden: "Dit bestand is leeg." };
  }

  if (bestand.size > MAX_BESTANDSGROOTTE_BYTES) {
    return {
      toegestaan: false,
      reden: `Dit bestand is ${formatBestandsgrootte(bestand.size)}. Maximaal ${MAX_BESTANDSGROOTTE_MB} MB per bestand.`,
    };
  }

  // Sommige browsers geven voor minder gangbare formaten een leeg type door.
  // Dan is de extensie het enige houvast dat we hebben.
  const type = bestand.type || raadMimetypeUitNaam(bestand.name);

  if (!TOEGESTANE_MIMETYPES.includes(type)) {
    return {
      toegestaan: false,
      reden: "Dit bestandstype wordt niet ondersteund. Kies een afbeelding, PDF of documentbestand.",
    };
  }

  return { toegestaan: true };
}

const EXTENSIE_NAAR_MIMETYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
  txt: "text/plain",
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export function raadMimetypeUitNaam(bestandsnaam: string): string {
  const extensie = bestandsnaam.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSIE_NAAR_MIMETYPE[extensie] ?? "";
}

export function isAfbeelding(bestandsnaam: string, mimetype?: string | null): boolean {
  const type = mimetype || raadMimetypeUitNaam(bestandsnaam);
  return type.startsWith("image/");
}

export function isPdf(bestandsnaam: string, mimetype?: string | null): boolean {
  const type = mimetype || raadMimetypeUitNaam(bestandsnaam);
  return type === "application/pdf";
}

/** Kort label bij het bestand, zodat de soort in één oogopslag duidelijk is. */
export function bestandssoort(bestandsnaam: string, mimetype?: string | null): string {
  if (isAfbeelding(bestandsnaam, mimetype)) return "Foto";
  if (isPdf(bestandsnaam, mimetype)) return "PDF";
  const extensie = bestandsnaam.split(".").pop()?.toUpperCase();
  return extensie && extensie !== bestandsnaam.toUpperCase() ? extensie : "Bestand";
}

export function formatBestandsgrootte(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

/**
 * Maakt van een bestandsnaam een veilig pad voor Supabase Storage.
 *
 * Spaties, accenten en leestekens leverden eerder een pad op dat de opslag
 * anders opsloeg dan wij in de database noteerden, waardoor verwijderen het
 * bestand liet staan. De oorspronkelijke naam blijft in de kolom
 * `bestandsnaam` staan en is dus wat de gebruiker blijft zien.
 */
export function veiligePadnaam(bestandsnaam: string, nu: number = Date.now()): string {
  const laatstePunt = bestandsnaam.lastIndexOf(".");
  const basis = laatstePunt > 0 ? bestandsnaam.slice(0, laatstePunt) : bestandsnaam;
  const extensie = laatstePunt > 0 ? bestandsnaam.slice(laatstePunt + 1).toLowerCase() : "";

  const schoon = basis
    .normalize("NFD")
    // Accenttekens verwijderen, zodat "café" niet "cafe%CC%81" wordt.
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60);

  const veiligeBasis = schoon || "bestand";
  const veiligeExtensie = extensie.replace(/[^a-z0-9]/g, "");

  return veiligeExtensie ? `${nu}-${veiligeBasis}.${veiligeExtensie}` : `${nu}-${veiligeBasis}`;
}
