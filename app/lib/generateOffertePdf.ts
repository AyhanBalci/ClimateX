import { jsPDF } from "jspdf";
import { Offerte } from "./types";

export type KlantGegevens = {
  naam: string;
  telefoon: string;
  email: string;
  plaats: string;
  type_woning: string;
};

export const OFFERTE_GELDIGHEID_DAGEN = 30;

const ALGEMENE_VOORWAARDEN = [
  "Deze offerte is vrijblijvend en geldig tot de hierboven vermelde geldigheidsdatum.",
  "Genoemde prijzen zijn inclusief btw, tenzij anders vermeld, en zijn gebaseerd op de bij ClimateX bekende situatie.",
  "Na akkoord plant ClimateX de werkzaamheden in overleg met de klant in.",
  "Op alle offertes en overeenkomsten van ClimateX zijn de algemene voorwaarden van ClimateX van toepassing.",
  "Eventuele meerwerkzaamheden worden vooraf met de klant afgestemd en apart in rekening gebracht.",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function addGeldigheidsdatum(datum: string) {
  const date = new Date(datum);
  date.setDate(date.getDate() + OFFERTE_GELDIGHEID_DAGEN);
  return date.toLocaleDateString("nl-NL");
}

export function buildOffertePdfDocument(offerte: Offerte, klant: KlantGegevens): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header band met logo
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 38, "F");

  doc.setFillColor(34, 211, 238);
  doc.roundedRect(margin, 10, 18, 18, 4, 4, "F");
  doc.setTextColor(10, 10, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("CX", margin + 9, 21.5, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("ClimateX", margin + 24, 19);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("06 1400 4488", margin + 24, 26);

  doc.setFontSize(10);
  doc.text(`Offertenummer: ${offerte.offertenummer}`, pageWidth - margin, 14, { align: "right" });
  doc.text(`Datum: ${new Date(offerte.datum).toLocaleDateString("nl-NL")}`, pageWidth - margin, 20, { align: "right" });
  doc.text(`Geldig tot: ${addGeldigheidsdatum(offerte.datum)}`, pageWidth - margin, 26, { align: "right" });

  let y = 50;
  doc.setTextColor(20, 20, 20);

  const section = (title: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(title, margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 24) {
      doc.addPage();
      y = 20;
    }
  };

  const divider = () => {
    y += 3;
    doc.setDrawColor(225, 225, 225);
    doc.line(margin, y, pageWidth - margin, y);
    y += 9;
  };

  // Klantgegevens
  section("Klantgegevens");
  [
    `Naam: ${klant.naam}`,
    `Telefoon: ${klant.telefoon}`,
    `Email: ${klant.email}`,
    `Plaats: ${klant.plaats}`,
    `Type woning: ${klant.type_woning}`,
  ].forEach((line) => {
    doc.text(line, margin, y);
    y += 6;
  });
  divider();

  // Product / dienst
  section("Product / dienst");
  doc.text(`${offerte.merk} ${offerte.model}`, margin, y);
  y += 6;
  divider();

  // Werkzaamheden
  if (offerte.werkzaamheden && offerte.werkzaamheden.trim()) {
    ensureSpace(20);
    section("Werkzaamheden");
    offerte.werkzaamheden
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => {
        doc.text(`• ${item}`, margin, y);
        y += 6;
      });
    divider();
  }

  // Opmerkingen
  if (offerte.opmerkingen && offerte.opmerkingen.trim()) {
    ensureSpace(20);
    section("Opmerkingen");
    const lines = doc.splitTextToSize(offerte.opmerkingen, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 6;
    divider();
  }

  // Totaalprijs
  ensureSpace(20);
  y += 2;
  doc.setFillColor(34, 211, 238);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 3, 3, "F");
  doc.setTextColor(10, 10, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Totaalbedrag: ${formatCurrency(offerte.prijs)}`, pageWidth / 2, y + 10.5, { align: "center" });
  y += 26;
  doc.setTextColor(20, 20, 20);

  // Algemene voorwaarden
  ensureSpace(40);
  section("Algemene voorwaarden");
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  ALGEMENE_VOORWAARDEN.forEach((regel) => {
    const lines = doc.splitTextToSize(`• ${regel}`, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 4.5;
  });
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(10);
  divider();

  // Akkoordverklaring
  ensureSpace(35);
  section("Akkoordverklaring");
  doc.setFontSize(9);
  doc.text("Door ondertekening gaat u akkoord met deze offerte en de algemene voorwaarden van ClimateX.", margin, y);
  y += 14;
  doc.setDrawColor(200, 200, 200);
  const lineWidth = (pageWidth - margin * 2 - 10) / 2;
  doc.line(margin, y, margin + lineWidth, y);
  doc.line(margin + lineWidth + 10, y, margin + lineWidth * 2 + 10, y);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("Handtekening klant", margin, y + 5);
  doc.text("Datum", margin + lineWidth + 10, y + 5);

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text("ClimateX — 06 1400 4488 — Premium airco-installatie met montage en service", pageWidth / 2, pageHeight - 10, {
    align: "center",
  });

  return doc;
}

export function downloadOffertePdf(offerte: Offerte, klant: KlantGegevens) {
  const doc = buildOffertePdfDocument(offerte, klant);
  doc.save(`${offerte.offertenummer}.pdf`);
}
