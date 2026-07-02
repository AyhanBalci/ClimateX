export type Specificatie = {
  label: string;
  waarde: string;
};

export type LaadpaalSpec = {
  merk: string;
  model: string;
  slug: string;
  tagline: string;
  beschrijving: string;
  voordelen: string[];
  specificaties: Specificatie[];
  slimmeFuncties: string[];
  installatie: string[];
  garantie: string;
  levertijd: string;
  vanafPrijs: number;
  geschiktVoor: string[];
  faqs: { vraag: string; antwoord: string }[];
  gerelateerd: string[]; // slugs
};

export const LAADPAAL_SPECIFICATIES: LaadpaalSpec[] = [
  {
    merk: "Alfen",
    model: "Eve Single Pro-line",
    slug: "alfen-eve-single-pro-line",
    tagline: "De meest populaire zakelijke laadpaal voor thuis en op het werk.",
    beschrijving:
      "De Alfen Eve Single Pro-line is een robuuste, stijlvolle laadpaal die flexibel inzetbaar is voor zowel particuliere als zakelijke toepassingen. Met geavanceerde communicatiemogelijkheden, load balancing en een bewezen track record in Nederland is dit de veiligste keuze.",
    voordelen: [
      "Meest verkochte laadpaal in Nederland",
      "Uitstekende betrouwbaarheid en build-quality",
      "OCPP 1.6 ondersteuning voor slim beheer",
      "Geschikt voor 1- en 3-fase aansluitingen",
      "Compact en weerbestendig design (IP54)",
      "Eenvoudig te koppelen aan energiemanagementsystemen",
    ],
    specificaties: [
      { label: "Laadvermogen", waarde: "11 kW (3-fase) / 7,4 kW (1-fase)" },
      { label: "Aansluiting", waarde: "1-fase of 3-fase 400V" },
      { label: "Kabellengte", waarde: "Vaste kabel 6 m of type 2 stopcontact" },
      { label: "Beschermingsgraad", waarde: "IP54 — spatwaterdicht" },
      { label: "Communicatie", waarde: "OCPP 1.6, WiFi, 4G (optioneel)" },
      { label: "Display", waarde: "LED-statusring" },
      { label: "Afmetingen", waarde: "356 × 152 × 100 mm" },
      { label: "Garantie", waarde: "3 jaar fabrieksgarantie" },
    ],
    slimmeFuncties: [
      "Load balancing — verdeelt stroom over meerdere laadpunten",
      "OCPP 1.6 voor backendbeheer en rapportage",
      "Laadprofiel instellen via app of beheerplatform",
      "Compatibel met Alfen Eve Manager",
      "Laadtijden plannen op basis van daluren",
    ],
    installatie: [
      "Installatie door NEN 1010 gecertificeerde monteur",
      "Inclusief meterkastbeoordeling",
      "Kabel en bevestigingsmateriaal inbegrepen",
      "Opleverdocumentatie en testrapport",
      "Instructie bij oplevering",
    ],
    garantie: "3 jaar",
    levertijd: "1–2 weken",
    vanafPrijs: 1295,
    geschiktVoor: ["Particulier", "Zakelijk", "VvE"],
    faqs: [
      {
        vraag: "Werkt de Alfen Eve ook met een 1-fase aansluiting?",
        antwoord:
          "Ja. De Alfen Eve Single Pro-line is beschikbaar in een 1-fase versie (max. 7,4 kW) en een 3-fase versie (max. 11 kW). Wij adviseren u bij de offerte welke het beste past bij uw aansluiting.",
      },
      {
        vraag: "Kan ik meerdere Alfen Eve laadpalen koppelen?",
        antwoord:
          "Ja, via het ingebouwde load balancing protocol kunnen meerdere Alfen-laadpalen samen de beschikbare stroom slim verdelen.",
      },
      {
        vraag: "Is de Alfen Eve geschikt voor buiten?",
        antwoord:
          "Ja. Met een IP54-beschermingsgraad is de laadpaal bestand tegen regen en spatwater — perfect voor oprit of garage.",
      },
    ],
    gerelateerd: ["zaptec-go", "easee-one"],
  },
  {
    merk: "Zaptec",
    model: "Zaptec Go",
    slug: "zaptec-go",
    tagline: "Strak Scandinavisch design met slimme laadtechnologie.",
    beschrijving:
      "De Zaptec Go combineert een minimalistisch wit design met geavanceerde laadtechnologie. Ingebouwde load balancing, een krachtige app en 5 jaar garantie maken dit de meest complete keuze voor het thuisladen.",
    voordelen: [
      "5 jaar fabrieksgarantie — beste in class",
      "Ingebouwde load balancing zonder extra module",
      "Strak design dat past in elke omgeving",
      "Eenvoudige installatie dankzij licht gewicht",
      "App-besturing en laadgeschiednis",
      "Automatisch updaten via de cloud",
    ],
    specificaties: [
      { label: "Laadvermogen", waarde: "11 kW (3-fase)" },
      { label: "Aansluiting", waarde: "3-fase 400V" },
      { label: "Kabellengte", waarde: "Type 2 stopcontact (kabel apart)" },
      { label: "Beschermingsgraad", waarde: "IP54" },
      { label: "Communicatie", waarde: "WiFi, OCPP 2.0.1" },
      { label: "Gewicht", waarde: "1,5 kg" },
      { label: "Kleur", waarde: "Artic White" },
      { label: "Garantie", waarde: "5 jaar" },
    ],
    slimmeFuncties: [
      "Ingebouwde load balancing via Zaptec-ecosysteem",
      "Zaptec app: laden plannen, statistieken, kostenregistratie",
      "Automatische firmware-updates via WiFi",
      "Gekoppeld aan P1-poort voor realtime verbruiksmeting",
      "Geschikt voor meerdere gebruikers en RFID-autorisatie",
    ],
    installatie: [
      "Licht apparaat, eenvoudig te monteren",
      "Inclusief inbouwdoos voor een strakke afwerking",
      "Installatie door NEN 1010 gecertificeerde monteur",
      "WiFi-configuratie bij oplevering",
    ],
    garantie: "5 jaar",
    levertijd: "1–2 weken",
    vanafPrijs: 1095,
    geschiktVoor: ["Particulier", "VvE"],
    faqs: [
      {
        vraag: "Heeft de Zaptec Go een vaste laadkabel?",
        antwoord:
          "Nee, de Zaptec Go heeft een type 2 laadstopcontact. U sluit uw eigen kabel aan. Dit is hygiënischer en flexibeler als meerdere personen de laadpaal gebruiken.",
      },
      {
        vraag: "Werkt de Zaptec Go ook zonder WiFi?",
        antwoord:
          "Ja, de laadpaal werkt als standalone unit. WiFi is nodig voor app-functies, statistieken en load balancing met meerdere Zaptec-laadpunten.",
      },
    ],
    gerelateerd: ["alfen-eve-single-pro-line", "wallbox-pulsar-plus"],
  },
  {
    merk: "Wallbox",
    model: "Pulsar Plus",
    slug: "wallbox-pulsar-plus",
    tagline: "De kleinste 22 kW laadpaal ter wereld, groot in mogelijkheden.",
    beschrijving:
      "De Wallbox Pulsar Plus is een compacte, krachtige laadpaal die met zijn slimme app en gunstige prijs een uitstekende keuze is voor thuisladen. Met Power Boost kunt u laden zonder uw netaansluiting te overbelasten.",
    voordelen: [
      "Meest compacte 22 kW laadpaal beschikbaar",
      "Lage inkoopprijs met uitstekende functies",
      "Power Boost — voorkomt piekbelasting op uw aansluiting",
      "Mybox app: statistieken, planning en kostenregistratie",
      "Bluetooth en WiFi-verbinding",
      "Kleurkeuze mogelijk",
    ],
    specificaties: [
      { label: "Laadvermogen", waarde: "22 kW (3-fase) / 7,4 kW (1-fase)" },
      { label: "Aansluiting", waarde: "1- of 3-fase" },
      { label: "Kabellengte", waarde: "Type 2 stopcontact" },
      { label: "Beschermingsgraad", waarde: "IP54" },
      { label: "Communicatie", waarde: "Bluetooth, WiFi, OCPP" },
      { label: "Gewicht", waarde: "1,8 kg" },
      { label: "Garantie", waarde: "3 jaar" },
    ],
    slimmeFuncties: [
      "Power Boost: realtime vermogensregeling op basis van huisverbruik",
      "Eco Smart-modus: laad op zonne-energie wanneer beschikbaar",
      "Mybox app met laadschema en live monitoring",
      "RFID-kaart en app-autorisatie",
      "Geavanceerde statistieken en CO₂-besparing",
    ],
    installatie: [
      "Licht en compact, eenvoudig te monteren",
      "P1-kabel inbegrepen voor Power Boost",
      "Installatie door NEN 1010 gecertificeerde monteur",
    ],
    garantie: "3 jaar",
    levertijd: "1–2 weken",
    vanafPrijs: 999,
    geschiktVoor: ["Particulier"],
    faqs: [
      {
        vraag: "Kan de Wallbox Pulsar Plus 22 kW laden?",
        antwoord:
          "Ja, op een 3-fase aansluiting laadt de Pulsar Plus tot 22 kW. Niet alle auto's ondersteunen 22 kW — veel auto's laden maximaal 11 kW thuis. Wij adviseren u bij de offerte.",
      },
      {
        vraag: "Wat is Power Boost bij de Wallbox?",
        antwoord:
          "Power Boost meet via de P1-poort uw actuele stroomverbruik en regelt het laadvermogen zo dat u nooit de groepsekast overbelast. U kunt dan vol laden terwijl de vaatwasser en wasmachine draaien.",
      },
    ],
    gerelateerd: ["zaptec-go", "easee-one"],
  },
  {
    merk: "Easee",
    model: "Easee One",
    slug: "easee-one",
    tagline: "De slimste en meest veelzijdige laadpaal voor thuis én zakelijk.",
    beschrijving:
      "De Easee One is de best beoordeelde laadpaal van Scandinavische makelij. Met ingebouwde dynamic load balancing, tot 22 kW laadvermogen en een mooie app is het de perfecte laadpaal voor iedereen die iets extra's wil.",
    voordelen: [
      "Ingebouwde dynamic load balancing",
      "Tot 22 kW laadvermogen op 3-fase",
      "Modulaire opbouw: eenvoudig uit te breiden",
      "5 jaar garantie",
      "Easee app met slim laden op zonne-energie",
      "Geschikt voor particulier, zakelijk en VvE",
    ],
    specificaties: [
      { label: "Laadvermogen", waarde: "22 kW (3-fase) / 7,4 kW (1-fase)" },
      { label: "Aansluiting", waarde: "1- of 3-fase" },
      { label: "Kabellengte", waarde: "Type 2 stopcontact" },
      { label: "Beschermingsgraad", waarde: "IP54" },
      { label: "Communicatie", waarde: "WiFi, 4G, OCPP 1.6" },
      { label: "Garantie", waarde: "5 jaar" },
      { label: "Kleur", waarde: "Chalk White / Black" },
    ],
    slimmeFuncties: [
      "Dynamic load balancing: reageert realtime op ander verbruik",
      "Easee-ecosysteem: meerdere laadpalen eenvoudig koppelen",
      "Laad op zonnestroom via de Easee app",
      "Kostenregistratie per laadsessie",
      "RFID-autorisatie voor meerdere gebruikers",
    ],
    installatie: [
      "Inclusief klem voor DIN-rail of directe wandmontage",
      "Eenvoudig schaalbaar naar meerdere laadpunten",
      "Installatie door NEN 1010 gecertificeerde monteur",
    ],
    garantie: "5 jaar",
    levertijd: "1–2 weken",
    vanafPrijs: 1395,
    geschiktVoor: ["Particulier", "Zakelijk", "VvE"],
    faqs: [
      {
        vraag: "Wat is het verschil tussen load balancing en dynamic load balancing?",
        antwoord:
          "Load balancing verdeelt een vast beschikbaar vermogen over meerdere laadpalen. Dynamic load balancing reageert real-time op het actuele stroomverbruik in uw pand en past het laadvermogen automatisch aan — ook als de wasmachine of oven aanslaat.",
      },
      {
        vraag: "Kan ik later een tweede Easee One bijplaatsen?",
        antwoord:
          "Ja. Dankzij de modulaire opbouw kunt u eenvoudig een tweede (of derde) laadpaal toevoegen. De bestaande installatie hoeft nauwelijks aangepast te worden.",
      },
    ],
    gerelateerd: ["alfen-eve-single-pro-line", "abb-terra-ac-wallbox"],
  },
  {
    merk: "EVBox",
    model: "Elvi",
    slug: "evbox-elvi",
    tagline: "Nederlands merk, premium kwaliteit, ideaal voor thuis.",
    beschrijving:
      "De EVBox Elvi is een slimme, stijlvolle laadpaal van een van de grootste laadinfrastructuurleveranciers ter wereld. Met de intuïtieve app en de keuze uit kleuren past de Elvi in elk interieur en op elke oprit.",
    voordelen: [
      "Gemaakt door een van de grootste laadleveranciers wereldwijd",
      "Beschikbaar in meerdere kleuren",
      "Smart charging via EVBox-app",
      "Compatibel met zonnepanelen en thuisbatterijen",
      "3 jaar garantie inclusief service",
    ],
    specificaties: [
      { label: "Laadvermogen", waarde: "11 kW (3-fase)" },
      { label: "Aansluiting", waarde: "3-fase" },
      { label: "Kabellengte", waarde: "Type 2 stopcontact of vaste kabel 6 m" },
      { label: "Beschermingsgraad", waarde: "IP55" },
      { label: "Communicatie", waarde: "WiFi, OCPP 1.6" },
      { label: "Garantie", waarde: "3 jaar" },
    ],
    slimmeFuncties: [
      "Smart charging via EVBox app",
      "Laadschema op basis van energieprijzen",
      "Compatibel met zonnepanelen voor groen laden",
      "Statistieken en laadgeschiednis",
    ],
    installatie: [
      "Plug & charge installatie",
      "Inclusief wandhouder en aansluitkabel",
      "Installatie door NEN 1010 gecertificeerde monteur",
    ],
    garantie: "3 jaar",
    levertijd: "2–3 weken",
    vanafPrijs: 1650,
    geschiktVoor: ["Particulier", "Zakelijk"],
    faqs: [
      {
        vraag: "Welke kleuren zijn beschikbaar voor de EVBox Elvi?",
        antwoord:
          "De EVBox Elvi is beschikbaar in wit, zwart en verschillende andere kleuren. Vraag bij uw offerte naar de actuele beschikbaarheid.",
      },
    ],
    gerelateerd: ["wallbox-pulsar-plus", "zaptec-go"],
  },
  {
    merk: "ABB",
    model: "Terra AC Wallbox",
    slug: "abb-terra-ac-wallbox",
    tagline: "Industriële betrouwbaarheid voor veeleisende zakelijke omgevingen.",
    beschrijving:
      "De ABB Terra AC Wallbox staat synoniem voor industriële betrouwbaarheid en is de eerste keuze voor wagenparken, bedrijfsterreinen en VvE-projecten met hoge bezettingsgraad. Dynamic load balancing en robuuste hardware garanderen jaren probleemloze werking.",
    voordelen: [
      "Industriële betrouwbaarheid van ABB — wereldleider in laadinfrastructuur",
      "Dynamic load balancing inclusief",
      "Geschikt voor hoge bezettingsgraad (24/7)",
      "OCPP 2.0 voor geavanceerd backendbeheer",
      "Robuust IP54-behuizing voor buitenapplicaties",
    ],
    specificaties: [
      { label: "Laadvermogen", waarde: "22 kW (3-fase)" },
      { label: "Aansluiting", waarde: "3-fase 400V" },
      { label: "Kabellengte", waarde: "Type 2 stopcontact" },
      { label: "Beschermingsgraad", waarde: "IP54 / IK10" },
      { label: "Communicatie", waarde: "Ethernet, WiFi, 4G, OCPP 2.0" },
      { label: "Display", waarde: "4,3\" kleurenscherm" },
      { label: "Garantie", waarde: "2 jaar (verlengbaar)" },
    ],
    slimmeFuncties: [
      "Dynamic load balancing voor meerdere gelijktijdige laadsessies",
      "RFID, app en pincode autorisatie",
      "Kostenberekening en facturatie per laadsessie",
      "Integratie met fleet management software",
      "Remote monitoring en diagnostics",
    ],
    installatie: [
      "Installatie inclusief fundatieplaat voor buitenplaatsing",
      "Netwerkconfiguratie en backend-koppeling bij oplevering",
      "Installatie door NEN 1010 gecertificeerde monteur",
    ],
    garantie: "2 jaar",
    levertijd: "2–4 weken",
    vanafPrijs: 1795,
    geschiktVoor: ["Zakelijk", "VvE"],
    faqs: [
      {
        vraag: "Is de ABB Terra AC ook geschikt voor buiten?",
        antwoord:
          "Ja. De ABB Terra AC heeft een IK10-certificering (vandaalsbestendig) en IP54-waterbestendigheid, waardoor het perfect geschikt is voor buitenapplicaties zoals parkeerterreinen.",
      },
      {
        vraag: "Kan ik de ABB Terra AC koppelen aan mijn fleet management systeem?",
        antwoord:
          "Ja. Via OCPP 2.0 is de ABB Terra AC te koppelen aan alle gangbare fleet management en energie management systemen.",
      },
    ],
    gerelateerd: ["easee-one", "alfen-eve-single-pro-line"],
  },
  {
    merk: "Smappee",
    model: "EV Wall Business",
    slug: "smappee-ev-wall-business",
    tagline: "Slim energiemanagement en laden in één geïntegreerd systeem.",
    beschrijving:
      "De Smappee EV Wall Business is uniek: het combineert een laadpaal met een volledig energiemanagementsysteem. U ziet realtime uw totale energieverbruik, productie van zonnepanelen en laadsessies in één dashboard.",
    voordelen: [
      "Geïntegreerd energiemanagementsysteem inclusief",
      "Realtime inzicht in totaalverbruik, productie en laden",
      "Koppeling met zonnepanelen voor maximale zelfconsumptie",
      "Dynamic load balancing op basis van volledig huisverbruik",
      "Smappee app met uitgebreide energierapportage",
    ],
    specificaties: [
      { label: "Laadvermogen", waarde: "22 kW (3-fase)" },
      { label: "Aansluiting", waarde: "3-fase" },
      { label: "Communicatie", waarde: "WiFi, OCPP 1.6" },
      { label: "Beschermingsgraad", waarde: "IP54" },
      { label: "Garantie", waarde: "3 jaar" },
    ],
    slimmeFuncties: [
      "Volledig energiemanagementsysteem geïntegreerd",
      "Laad op zonnestroom — maximale terugverdientijd",
      "Realtime monitoring van alle elektriciteitsstromen",
      "Smart charging op basis van energieprijzen (dynamisch tarief)",
    ],
    installatie: [
      "Inclusief Smappee Infinity gateway voor energiemonitoring",
      "Installatie door NEN 1010 gecertificeerde monteur",
      "Uitgebreide app-configuratie bij oplevering",
    ],
    garantie: "3 jaar",
    levertijd: "2–3 weken",
    vanafPrijs: 1895,
    geschiktVoor: ["Particulier", "Zakelijk"],
    faqs: [
      {
        vraag: "Heb ik zonnepanelen nodig voor de Smappee?",
        antwoord:
          "Nee. De Smappee EV Wall werkt ook zonder zonnepanelen als volwaardige laadpaal met energiemonitoring. Met zonnepanelen haalt u het meeste uit het systeem.",
      },
    ],
    gerelateerd: ["easee-one", "wallbox-pulsar-plus"],
  },
];

export function getSpecBySlug(slug: string): LaadpaalSpec | undefined {
  return LAADPAAL_SPECIFICATIES.find((s) => s.slug === slug);
}

export function toProductSlug(merk: string, model: string): string {
  return `${merk}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
