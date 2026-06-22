import { jsPDF } from "jspdf";
import { Offerte } from "./types";

type KlantGegevens = {
  naam: string;
  telefoon: string;
  email: string;
  plaats: string;
  type_woning: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function downloadOffertePdf(offerte: Offerte, lead: KlantGegevens) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Header band
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 38, "F");

  // Logo placeholder
  doc.setFillColor(34, 211, 238);
  doc.roundedRect(margin, 10, 18, 18, 4, 4, "F");
  doc.setTextColor(10, 10, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("CX", margin + 9, 21.5, { align: "center" });

  // Bedrijfsnaam + telefoon
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("ClimateX", margin + 24, 19);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("06 1400 4488", margin + 24, 26);

  // Offertenummer + datum
  doc.setFontSize(10);
  doc.text(`Offertenummer: ${offerte.offertenummer}`, pageWidth - margin, 16, { align: "right" });
  doc.text(`Datum: ${new Date(offerte.datum).toLocaleDateString("nl-NL")}`, pageWidth - margin, 22, { align: "right" });

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

  const divider = () => {
    y += 3;
    doc.setDrawColor(225, 225, 225);
    doc.line(margin, y, pageWidth - margin, y);
    y += 9;
  };

  // Klantgegevens
  section("Klantgegevens");
  [
    `Naam: ${lead.naam}`,
    `Telefoon: ${lead.telefoon}`,
    `Email: ${lead.email}`,
    `Plaats: ${lead.plaats}`,
    `Type woning: ${lead.type_woning}`,
  ].forEach((line) => {
    doc.text(line, margin, y);
    y += 6;
  });
  divider();

  // Product
  section("Product");
  doc.text(`${offerte.merk} ${offerte.model}`, margin, y);
  y += 6;
  divider();

  // Werkzaamheden
  if (offerte.werkzaamheden && offerte.werkzaamheden.trim()) {
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
    section("Opmerkingen");
    const lines = doc.splitTextToSize(offerte.opmerkingen, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 6;
    divider();
  }

  // Totaalprijs
  y += 2;
  doc.setFillColor(34, 211, 238);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 3, 3, "F");
  doc.setTextColor(10, 10, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Totaalprijs: ${formatCurrency(offerte.prijs)}`, pageWidth / 2, y + 10.5, { align: "center" });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text("ClimateX — 06 1400 4488 — Premium airco-installatie met montage en service", pageWidth / 2, pageHeight - 10, {
    align: "center",
  });

  doc.save(`${offerte.offertenummer}.pdf`);
}
