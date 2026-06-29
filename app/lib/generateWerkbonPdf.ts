import { jsPDF } from "jspdf";
import { Werkbon } from "./types";

export function downloadWerkbonPdf(werkbon: Werkbon) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

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
  doc.text(`Werkbonnummer: ${werkbon.werkbonnummer}`, pageWidth - margin, 16, { align: "right" });
  doc.text(`Datum: ${new Date(werkbon.datum).toLocaleDateString("nl-NL")}`, pageWidth - margin, 22, { align: "right" });

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

  section("Klantgegevens");
  [
    `Naam: ${werkbon.klantnaam}`,
    `Adres: ${werkbon.adres || "-"}`,
    `Telefoon: ${werkbon.telefoon || "-"}`,
    `Installateur: ${werkbon.monteur || "-"}`,
    `Serienummer laadpaal: ${werkbon.serienummer || "-"}`,
  ].forEach((line) => {
    doc.text(line, margin, y);
    y += 6;
  });
  divider();

  if (werkbon.testresultaten && werkbon.testresultaten.trim()) {
    section("Testresultaten");
    const lines = doc.splitTextToSize(werkbon.testresultaten, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 6;
    divider();
  }

  if (werkbon.werkzaamheden && werkbon.werkzaamheden.trim()) {
    section("Werkzaamheden");
    const lines = doc.splitTextToSize(werkbon.werkzaamheden, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 6;
    divider();
  }

  if (werkbon.materialen && werkbon.materialen.trim()) {
    section("Materialen");
    const lines = doc.splitTextToSize(werkbon.materialen, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 6;
    divider();
  }

  if (werkbon.opmerkingen && werkbon.opmerkingen.trim()) {
    section("Opmerkingen");
    const lines = doc.splitTextToSize(werkbon.opmerkingen, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 6;
    divider();
  }

  y += 4;
  section("Handtekeningen");
  const colWidth = (pageWidth - margin * 2 - 10) / 2;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y + 14, margin + colWidth, y + 14);
  doc.line(margin + colWidth + 10, y + 14, margin + colWidth * 2 + 10, y + 14);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Klant: ${werkbon.handtekening_klant || ""}`, margin, y + 19);
  doc.text(`Installateur: ${werkbon.handtekening_monteur || ""}`, margin + colWidth + 10, y + 19);

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text("ClimateX — 06 1400 4488 — Slimme energieoplossingen voor woningen en bedrijven", pageWidth / 2, pageHeight - 10, {
    align: "center",
  });

  doc.save(`${werkbon.werkbonnummer}.pdf`);
}
