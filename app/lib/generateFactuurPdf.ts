import { jsPDF } from "jspdf";
import { Factuur } from "./types";
import { isSupabaseConfigured, supabase } from "./supabase";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(value);
}

export async function downloadFactuurPdf(factuur: Factuur) {
  let installatiegegevens: { serienummer: string | null; datum: string | null } | null = null;

  if (factuur.werkbon_id && isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from("werkbonnen")
      .select("serienummer, datum")
      .eq("id", factuur.werkbon_id)
      .maybeSingle();
    if (data) {
      installatiegegevens = { serienummer: data.serienummer, datum: data.datum };
    }
  }

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
  doc.text(`Factuurnummer: ${factuur.factuurnummer}`, pageWidth - margin, 16, { align: "right" });
  doc.text(`Datum: ${new Date(factuur.created_at).toLocaleDateString("nl-NL")}`, pageWidth - margin, 22, { align: "right" });

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

  section("Klant");
  doc.text(factuur.klant, margin, y);
  y += 6;
  divider();

  if (installatiegegevens) {
    section("Installatiegegevens");
    doc.text(`Serienummer laadpaal: ${installatiegegevens.serienummer || "-"}`, margin, y);
    y += 6;
    if (installatiegegevens.datum) {
      doc.text(`Installatiedatum: ${new Date(installatiegegevens.datum).toLocaleDateString("nl-NL")}`, margin, y);
      y += 6;
    }
    doc.text("Op de installatie en de laadpaal geldt standaard garantie van ClimateX.", margin, y);
    y += 6;
    divider();
  }

  section("Specificatie");
  doc.text(`Bedrag excl. btw: ${formatCurrency(factuur.bedrag)}`, margin, y);
  y += 6;
  doc.text(`Btw (21%): ${formatCurrency(factuur.btw)}`, margin, y);
  y += 6;
  divider();

  doc.setFillColor(34, 211, 238);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 3, 3, "F");
  doc.setTextColor(10, 10, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Totaal te betalen: ${formatCurrency(factuur.totaal)}`, pageWidth / 2, y + 10.5, { align: "center" });
  y += 26;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Status: ${factuur.status}`, margin, y);
  y += 6;
  if (factuur.betaaldatum) {
    doc.text(`Betaald op: ${new Date(factuur.betaaldatum).toLocaleDateString("nl-NL")}`, margin, y);
    y += 6;
  }
  doc.text("Gelieve te betalen binnen 14 dagen na factuurdatum onder vermelding van het factuurnummer.", margin, y);

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text("ClimateX — 06 1400 4488 — Slimme energieoplossingen voor woningen en bedrijven", pageWidth / 2, pageHeight - 10, {
    align: "center",
  });

  doc.save(`${factuur.factuurnummer}.pdf`);
}
