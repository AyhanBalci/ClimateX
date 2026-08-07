import { jsPDF } from "jspdf";
import type { Offerte } from "./types";
import { formatBedrag, formatDatum } from "./formatters";
import { OFFERTE_GELDIGHEID_DAGEN } from "./constants";
import { AKKOORDTEKST } from "./offerteAcceptatie";

export type KlantGegevens = {
  naam: string;
  telefoon: string;
  email: string;
  plaats: string;
  type_woning: string;
};

/** Zelfde percentage en afronding als factuurActions, zodat offerte en factuur nooit uiteenlopen. */
const BTW_PERCENTAGE = 0.21;

function btwBedragen(prijsExclBtw: number) {
  const btw = Math.round(prijsExclBtw * BTW_PERCENTAGE * 100) / 100;
  const totaal = Math.round((prijsExclBtw + btw) * 100) / 100;
  return { excl: prijsExclBtw, btw, totaal };
}

const ALGEMENE_VOORWAARDEN = [
  "Deze offerte is vrijblijvend en geldig tot de hierboven vermelde geldigheidsdatum.",
  "Genoemde prijzen zijn exclusief btw, tenzij anders vermeld, en zijn gebaseerd op de bij ClimateX bekende situatie.",
  "Na akkoord plant ClimateX de installatie in overleg met de klant in.",
  "Op de installatie en de geleverde laadpaal geldt standaard garantie volgens de garantievoorwaarden van ClimateX.",
  "Op alle offertes en overeenkomsten van ClimateX zijn de algemene voorwaarden van ClimateX van toepassing.",
  "Eventuele meerwerkzaamheden, zoals het uitbreiden van de meterkast, worden vooraf met de klant afgestemd en apart in rekening gebracht.",
];

function addGeldigheidsdatum(datum: string) {
  const date = new Date(datum);
  date.setDate(date.getDate() + OFFERTE_GELDIGHEID_DAGEN);
  return formatDatum(date);
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
  doc.text(`Datum: ${formatDatum(offerte.datum)}`, pageWidth - margin, 20, { align: "right" });
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
        const lines = doc.splitTextToSize(`• ${item}`, pageWidth - margin * 2);
        ensureSpace(lines.length * 6);
        doc.text(lines, margin, y);
        y += lines.length * 6;
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

  // Prijsopbouw met btw-specificatie. De klant ziet hiermee vooraf exact
  // hetzelfde bedrag als later op de factuur komt te staan.
  const bedragen = btwBedragen(offerte.prijs);
  ensureSpace(42);
  section("Prijsopbouw");
  ([
    ["Subtotaal (excl. btw)", formatBedrag(bedragen.excl)],
    ["Btw (21%)", formatBedrag(bedragen.btw)],
  ] as const).forEach(([label, waarde]) => {
    doc.text(label, margin, y);
    doc.text(waarde, pageWidth - margin, y, { align: "right" });
    y += 6;
  });

  y += 2;
  doc.setFillColor(34, 211, 238);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 3, 3, "F");
  doc.setTextColor(10, 10, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Totaal incl. btw: ${formatBedrag(bedragen.totaal)}`, pageWidth / 2, y + 10.5, { align: "center" });
  y += 26;
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // Algemene voorwaarden
  ensureSpace(40);
  section("Algemene voorwaarden");
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  ALGEMENE_VOORWAARDEN.forEach((regel) => {
    const lines = doc.splitTextToSize(`• ${regel}`, pageWidth - margin * 2);
    ensureSpace(lines.length * 4.5);
    doc.text(lines, margin, y);
    y += lines.length * 4.5;
  });
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(10);
  divider();

  // Akkoordverklaring
  //
  // Accepteren gebeurt digitaal in het klantenportaal, niet meer met een
  // handtekening op papier. Is de offerte al geaccepteerd, dan staat hier het
  // vastgelegde moment; zo niet, dan wijst dit blok de klant de weg.
  ensureSpace(30);
  section("Akkoordverklaring");
  doc.setFontSize(9);

  if (offerte.geaccepteerd_op) {
    const moment = new Date(offerte.geaccepteerd_op);
    const leesbaar = Number.isNaN(moment.getTime())
      ? ""
      : moment.toLocaleString("nl-NL", { dateStyle: "long", timeStyle: "short" });

    doc.text("Deze offerte is door de klant digitaal geaccepteerd via het klantenportaal.", margin, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text(`Geaccepteerd op: ${leesbaar}`, margin, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    doc.setTextColor(120, 120, 120);
    doc.text(`Akkoordverklaring: "${AKKOORDTEKST}"`, margin, y);
  } else {
    const uitleg = doc.splitTextToSize(
      "U accepteert deze offerte digitaal in het klantenportaal van ClimateX. Vink daar de akkoordverklaring " +
        "aan en kies \"Offerte accepteren\". Wij leggen dan datum, tijd en de inhoud van deze offerte vast. " +
        "Een handtekening op papier is niet nodig.",
      pageWidth - margin * 2
    );
    doc.text(uitleg, margin, y);
    y += uitleg.length * 4.5;
  }

  // Footer op elke pagina. Dit gebeurt bewust pas na alle inhoud: pas dan is
  // bekend hoeveel pagina's het zijn geworden. Zonder deze lus kreeg alleen de
  // laatste pagina een footer en ontbrak elke paginanummering, waardoor losse
  // vellen van een meerpagina-offerte niet aan elkaar te koppelen waren.
  const paginas = doc.getNumberOfPages();
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      "ClimateX — 06 1400 4488 — Slimme energieoplossingen voor woningen en bedrijven",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(`Offerte ${offerte.offertenummer}`, margin, pageHeight - 10);
    doc.text(`Pagina ${p} van ${paginas}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  }

  return doc;
}

export function downloadOffertePdf(offerte: Offerte, klant: KlantGegevens) {
  const doc = buildOffertePdfDocument(offerte, klant);
  doc.save(`${offerte.offertenummer}.pdf`);
}
