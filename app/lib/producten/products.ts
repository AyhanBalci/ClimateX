import { Product } from "./types";

// Alle modelnamen, specificaties, afmetingen en garanties in dit bestand zijn
// geverifieerd tegen de officiële fabrikantwebsites en -datasheets
// (alfen.com, ratio.nl, easee.com, wallbox.com, zaptec.com) — augustus 2026.
// De vanaf-prijzen zijn commerciële ClimateX-prijzen inclusief installatie.

export const STANDAARD_INSTALLATIE = [
  "Installatie door NEN 1010 gecertificeerde monteur",
  "Inclusief meterkastbeoordeling vooraf",
  "Kabel en bevestigingsmateriaal inbegrepen",
  "Opleverdocumentatie en testrapport",
];

const STANDAARD_DOWNLOADS = (merk: string, model: string): Product["downloads"] => {
  const naam = model.toLowerCase().startsWith(merk.toLowerCase()) ? model : `${merk} ${model}`;
  return [
    { label: `Datasheet ${naam}`, type: "datasheet", bestand: "datasheet.pdf" },
    { label: `Installatiehandleiding ${naam}`, type: "handleiding", bestand: "handleiding.pdf" },
    { label: "Installatie-informatie & meterkasteisen", type: "installatie", bestand: "installatie-informatie.pdf" },
    { label: "Garantievoorwaarden", type: "garantie", bestand: "garantievoorwaarden.pdf" },
  ];
};

export const PRODUCTS: Product[] = [
  // ───────────────────────── Alfen ─────────────────────────
  {
    merkSlug: "alfen",
    productSlug: "eve-single-s-line",
    model: "Eve Single S-line",
    tagline: "Compacte Nederlandse thuislader met MID-meter en RFID.",
    beschrijving:
      "De Alfen Eve Single S-line is de compacte thuislaadoplossing van de Nederlandse marktleider. Met een MID-gecertificeerde energiemeter, RFID-lezer en laadvermogen tot 11 kW is dit een complete, betrouwbare laadpaal voor dagelijks thuisgebruik.",
    voordelen: [
      "Nederlandse kwaliteit — ontwikkeld en gebouwd door Alfen",
      "MID-gecertificeerde energiemeter standaard",
      "RFID-lezer voor toegangscontrole",
      "Active load balancing mogelijk (via P1/slimme meter)",
      "Eve Connect app voor slim laden op daluren of zonnestroom",
      "Compacte polycarbonaat behuizing voor binnen en buiten",
    ],
    specs: {
      vermogenKw: 11,
      vermogenLabel: "3,7 - 11 kW (1- of 3-fase)",
      fase: "1- of 3-fase",
      kabel: "los",
      kabellengteM: null,
      rfid: true,
      loadBalancing: true,
      dynamicLoadBalancing: true,
      midMeter: true,
      app: true,
      connectiviteit: ["ethernet", "4g"],
      garantieJaren: 2,
      garantieLabel: "2 jaar fabrieksgarantie (27 maanden)",
      installatietijd: "3 - 4 uur",
      installatieInbegrepen: true,
      beschermingsgraad: "IP55",
      afmetingen: "370 × 240 × 130 mm",
    },
    vanafPrijs: 1095,
    geschiktVoor: ["particulier"],
    badges: [],
    faqs: [
      {
        vraag: "Wat is het verschil tussen de S-line en de Pro-line?",
        antwoord:
          "De S-line is gericht op thuisgebruik en laadt tot 11 kW, zonder display. De Pro-line laadt tot 22 kW, heeft een kleurendisplay en is ook geschikt voor intensief zakelijk gebruik.",
      },
      {
        vraag: "Ondersteunt de S-line load balancing?",
        antwoord:
          "Ja, via Alfen Active Load Balancing (optionele licentie) meet de laadpaal het actuele verbruik via uw P1 slimme meter of een externe Modbus-meter en past het laadvermogen dynamisch aan.",
      },
    ],
    downloads: STANDAARD_DOWNLOADS("Alfen", "Eve Single S-line"),
    gerelateerd: ["alfen/eve-single-pro-line", "zaptec/go", "easee/charge-up"],
    imageExt: "svg",
  },
  {
    merkSlug: "alfen",
    productSlug: "eve-single-pro-line",
    model: "Eve Single Pro-line",
    tagline: "De veelzijdige allrounder tot 22 kW, voor thuis en zakelijk.",
    beschrijving:
      "De Alfen Eve Single Pro-line is een van de meest geïnstalleerde laadpalen van Nederland. Met laadvermogen tot 22 kW, kleurendisplay, MID-meter en uitgebreide OCPP-ondersteuning is dit de bewezen keuze voor zowel opritten als bedrijfsterreinen.",
    voordelen: [
      "Laadvermogen tot 22 kW (1- en 3-fase varianten)",
      "Kleurendisplay met statusinformatie",
      "MID-gecertificeerde meter voor financiële verrekening",
      "RFID-lezer voor gebruikersidentificatie",
      "OCPP 1.6 en 2.0.1 voor koppeling met beheerplatformen",
      "Smart Charging Network: tot 100 laadpunten koppelbaar",
    ],
    specs: {
      vermogenKw: 22,
      vermogenLabel: "3,7 - 22 kW (1- of 3-fase)",
      fase: "1- of 3-fase",
      kabel: "vast of los",
      kabellengteM: 6,
      rfid: true,
      loadBalancing: true,
      dynamicLoadBalancing: true,
      midMeter: true,
      app: true,
      connectiviteit: ["ethernet", "4g"],
      garantieJaren: 2,
      garantieLabel: "2 jaar fabrieksgarantie (27 maanden)",
      installatietijd: "3 - 4 uur",
      installatieInbegrepen: true,
      beschermingsgraad: "IP55",
      afmetingen: "370 × 240 × 130 mm",
    },
    vanafPrijs: 1395,
    geschiktVoor: ["particulier", "zakelijk"],
    badges: ["Bestseller"],
    faqs: [
      {
        vraag: "Werkt de Eve Single Pro-line ook op een 1-fase aansluiting?",
        antwoord:
          "Ja. De Pro-line is leverbaar in 1-fase (tot 7,4 kW) en 3-fase (tot 22 kW) uitvoeringen. Wij adviseren bij de offerte welke variant past bij uw aansluiting en auto.",
      },
      {
        vraag: "Kan ik meerdere Alfen-laadpalen slim koppelen?",
        antwoord:
          "Ja, via Alfen's Smart Charging Network kunnen tot 100 laadpunten onderling het beschikbare vermogen verdelen. Active Load Balancing houdt daarnaast rekening met het verbruik van uw pand.",
      },
      {
        vraag: "Is de Pro-line geschikt voor buiten?",
        antwoord: "Ja. De behuizing heeft beschermingsgraad IP55 en is ontworpen voor jarenlang gebruik buitenshuis.",
      },
    ],
    downloads: STANDAARD_DOWNLOADS("Alfen", "Eve Single Pro-line"),
    gerelateerd: ["alfen/eve-single-s-line", "alfen/eve-double-pro-line", "easee/charge-max"],
    imageExt: "svg",
  },
  {
    merkSlug: "alfen",
    productSlug: "eve-double-pro-line",
    model: "Eve Double Pro-line",
    tagline: "Twee laadpunten in één zuil — dé oplossing voor VvE en wagenpark.",
    beschrijving:
      "De Alfen Eve Double Pro-line biedt twee type 2 laadpunten in één robuuste behuizing, elk tot 22 kW. Met MID-meting per laadpunt, RFID-identificatie en een groot 7-inch display is dit de standaard voor zakelijke laadpleinen en VvE-parkeergarages.",
    voordelen: [
      "Twee laadpunten (2× type 2), gelijktijdig tot 2× 22 kW",
      "MID-gecertificeerde meter per laadpunt voor eerlijke verrekening",
      "Groot 7-inch display (800×480)",
      "RFID-lezer voor gebruikersidentificatie",
      "Load balancing over beide laadpunten, dynamisch via slimme meter",
      "Robuuste behuizing voor intensief 24/7 gebruik, wand- of paalmontage",
    ],
    specs: {
      vermogenKw: 22,
      vermogenLabel: "2 × 22 kW (3-fase)",
      fase: "3-fase",
      kabel: "los",
      kabellengteM: null,
      rfid: true,
      loadBalancing: true,
      dynamicLoadBalancing: true,
      midMeter: true,
      app: true,
      connectiviteit: ["ethernet", "4g"],
      garantieJaren: 2,
      garantieLabel: "2 jaar fabrieksgarantie (27 maanden)",
      installatietijd: "5 - 6 uur",
      installatieInbegrepen: true,
      beschermingsgraad: "IP55",
      afmetingen: "590 × 338 × 230 mm",
    },
    vanafPrijs: 2795,
    geschiktVoor: ["zakelijk", "vve"],
    badges: [],
    faqs: [
      {
        vraag: "Kunnen twee auto's tegelijk op volle snelheid laden?",
        antwoord:
          "Ja, mits de netaansluiting het toelaat kan elk laadpunt gelijktijdig tot 22 kW leveren. Met (dynamic) load balancing wordt het beschikbare vermogen anders slim over beide punten verdeeld.",
      },
      {
        vraag: "Kan ik het verbruik per gebruiker factureren?",
        antwoord:
          "Ja. Elk laadpunt heeft een eigen MID-gekeurde meter en via OCPP koppelt de laadpaal met verrekenplatformen voor automatische facturatie per RFID-pas.",
      },
    ],
    downloads: STANDAARD_DOWNLOADS("Alfen", "Eve Double Pro-line"),
    gerelateerd: ["alfen/eve-single-pro-line", "zaptec/pro", "easee/charge-core"],
    imageExt: "svg",
  },

  // ───────────────────────── Ratio ─────────────────────────
  {
    merkSlug: "ratio",
    productSlug: "start",
    model: "Start",
    tagline: "Nederlandse instaplader: inpluggen en laden, zonder gedoe.",
    beschrijving:
      "De Ratio Start is de gebruiksvriendelijke instaplaadpaal van Ratio Electric uit Nijkerk. Dankzij Plug & Charge start het laden automatisch zodra u de stekker aansluit — zonder app, pas of registratie. De laadstroom is door de installateur instelbaar van 11 tot 22 kW.",
    voordelen: [
      "Plug & Charge: direct laden zonder app of laadpas",
      "Instelbaar laadvermogen van 11 tot 22 kW",
      "Made in Holland — 15+ jaar EV-ervaring",
      "Statische load balancing instelbaar door installateur",
      "Weerbestendige behuizing (IP54 / IK08)",
      "Leverbaar met socket of vaste kabel van 5 meter",
    ],
    specs: {
      vermogenKw: 22,
      vermogenLabel: "11 - 22 kW (3-fase, instelbaar)",
      fase: "3-fase",
      kabel: "vast of los",
      kabellengteM: 5,
      rfid: false,
      loadBalancing: true,
      dynamicLoadBalancing: false,
      midMeter: false,
      app: false,
      connectiviteit: [],
      garantieJaren: 3,
      garantieLabel: "3 jaar garantie (verlengbaar tot 5 jaar)",
      installatietijd: "2 - 3 uur",
      installatieInbegrepen: true,
      beschermingsgraad: "IP54",
      afmetingen: "Wand- of paalmontage",
    },
    vanafPrijs: 849,
    geschiktVoor: ["particulier"],
    badges: ["Beste instapprijs"],
    faqs: [
      {
        vraag: "Heb ik een app of laadpas nodig voor de Ratio Start?",
        antwoord:
          "Nee. De Ratio Start werkt volgens Plug & Charge: u steekt de stekker in de auto en het laden start automatisch. Bewust eenvoudig, zonder registratie.",
      },
      {
        vraag: "Wat betekent statische load balancing bij dit model?",
        antwoord:
          "De installateur stelt met een draaischakelaar het maximale laadvermogen in, afgestemd op uw meterkast. Zo blijft er altijd voldoende stroom over voor de rest van uw installatie.",
      },
    ],
    downloads: STANDAARD_DOWNLOADS("Ratio", "Start"),
    gerelateerd: ["ratio/solar-rfid", "wallbox/pulsar-plus", "zaptec/go"],
    imageExt: "svg",
  },
  {
    merkSlug: "ratio",
    productSlug: "solar-rfid",
    model: "Solar RFID",
    tagline: "Laad op eigen zonne-energie, met laadpas-toegang.",
    beschrijving:
      "De Ratio Solar RFID combineert slim laden op zonne-energie met een ingebouwde RFID-lezer. Via de optionele Sensorbox laadt uw auto met overschot van uw zonnepanelen — desgewenst 100% solar — en met de Ratio EV Charging app houdt u volledig inzicht in verbruik en laadsessies.",
    voordelen: [
      "Solar laden: gebruik uw eigen zonne-energie (via Sensorbox)",
      "Ingebouwde RFID-lezer voor toegang met laadpas",
      "Beheer en inzicht via de Ratio EV Charging app",
      "Laadvermogen 11 - 22 kW (3-fase)",
      "Made in Holland",
      "Leverbaar met socket of vaste kabel (5 of 7,5 meter)",
    ],
    specs: {
      vermogenKw: 22,
      vermogenLabel: "11 - 22 kW (3-fase)",
      fase: "3-fase",
      kabel: "vast of los",
      kabellengteM: 5,
      rfid: true,
      loadBalancing: true,
      dynamicLoadBalancing: true,
      midMeter: false,
      app: true,
      connectiviteit: ["wifi"],
      garantieJaren: 3,
      garantieLabel: "3 jaar garantie (verlengbaar tot 5 jaar)",
      installatietijd: "3 uur",
      installatieInbegrepen: true,
      beschermingsgraad: "IP54",
      afmetingen: "Wand- of paalmontage",
    },
    vanafPrijs: 1049,
    geschiktVoor: ["particulier"],
    badges: ["Solar laden"],
    faqs: [
      {
        vraag: "Hoe werkt solar laden bij de Ratio Solar RFID?",
        antwoord:
          "De optionele Ratio Sensorbox meet realtime uw opwek en verbruik. In de 'Pure Solar'-modus laadt de auto uitsluitend met overtollige zonne-energie, vanaf 1,4 kW.",
      },
      {
        vraag: "Is dynamic load balancing mogelijk?",
        antwoord:
          "Ja, met de Sensorbox/load balancing module past de laadpaal het vermogen dynamisch aan op het actuele verbruik van uw woning, zodat uw hoofdaansluiting nooit overbelast raakt.",
      },
    ],
    downloads: STANDAARD_DOWNLOADS("Ratio", "Solar RFID"),
    gerelateerd: ["ratio/solar-mid-4g", "ratio/start", "easee/charge-up"],
    imageExt: "svg",
  },
  {
    merkSlug: "ratio",
    productSlug: "solar-mid-4g",
    model: "Solar MID 4G",
    tagline: "Zakelijk solar laden met MID-meter en 4G — opvolger van de io6 Pro.",
    beschrijving:
      "De Ratio Solar MID 4G is het zakelijke topmodel van Ratio: een MID-gecertificeerde energiemeter voor correcte verrekening, RFID-toegang, solar laden en connectiviteit via 4G, WiFi én LAN. Schaalbaar tot 32 laadpunten in één opstelling.",
    voordelen: [
      "MID-gecertificeerde energiemeter voor correcte facturatie",
      "RFID-lezer voor toegang en verbruiksregistratie per gebruiker",
      "Solar laden op eigen zonne-energie",
      "Dynamic load balancing (optionele module)",
      "4G, WiFi en LAN — ook stabiel op locaties zonder vast netwerk",
      "Schaalbaar tot 32 laadpunten in één systeem",
    ],
    specs: {
      vermogenKw: 22,
      vermogenLabel: "11 - 22 kW (3-fase)",
      fase: "3-fase",
      kabel: "vast of los",
      kabellengteM: 5,
      rfid: true,
      loadBalancing: true,
      dynamicLoadBalancing: true,
      midMeter: true,
      app: true,
      connectiviteit: ["wifi", "ethernet", "4g"],
      garantieJaren: 3,
      garantieLabel: "3 jaar garantie (verlengbaar tot 5 jaar)",
      installatietijd: "3 - 4 uur",
      installatieInbegrepen: true,
      beschermingsgraad: "IP54",
      afmetingen: "Wand- of paalmontage",
    },
    vanafPrijs: 1349,
    geschiktVoor: ["particulier", "zakelijk", "vve"],
    badges: [],
    faqs: [
      {
        vraag: "Waarom is de MID-meter belangrijk?",
        antwoord:
          "Een MID-gecertificeerde meter garandeert een wettelijk erkende meting. Dat is vereist wanneer u laadkosten declareert bij uw werkgever of doorberekent aan gebruikers.",
      },
      {
        vraag: "Hoeveel laadpunten kan ik koppelen?",
        antwoord: "In één opstelling kunnen tot 32 Ratio-laadpunten worden gekoppeld, met dynamische verdeling van het beschikbare vermogen.",
      },
    ],
    downloads: STANDAARD_DOWNLOADS("Ratio", "Solar MID 4G"),
    gerelateerd: ["ratio/solar-rfid", "alfen/eve-single-pro-line", "zaptec/pro"],
    imageExt: "svg",
  },

  // ───────────────────────── Easee ─────────────────────────
  {
    merkSlug: "easee",
    productSlug: "charge-up",
    model: "Charge Up",
    tagline: "De slimme Noorse thuislader — compact, licht en toekomstbestendig.",
    beschrijving:
      "De Easee Charge Up is de huidige thuislader van het Noorse Easee. Tot 22 kW laadvermogen, ingebouwde RFID-lezer, load- en fasebalancering via Easee Link en 5 jaar garantie — in een behuizing van slechts 1,5 kg.",
    voordelen: [
      "Tot 22 kW (3-fase) of 7,4 kW (1-fase)",
      "Slechts 1,5 kg — snelle, nette installatie",
      "Ingebouwde RFID/NFC-lezer",
      "Easee Link: load- en fasebalancering tot 3 laders thuis",
      "WiFi, Bluetooth én ingebouwd 4G (LTE Cat-M1)",
      "5 jaar fabrieksgarantie",
    ],
    specs: {
      vermogenKw: 22,
      vermogenLabel: "22 kW (3-fase) / 7,4 kW (1-fase)",
      fase: "1- of 3-fase",
      kabel: "los",
      kabellengteM: null,
      rfid: true,
      loadBalancing: true,
      dynamicLoadBalancing: true,
      midMeter: false,
      app: true,
      connectiviteit: ["wifi", "bluetooth", "4g"],
      garantieJaren: 5,
      garantieLabel: "5 jaar fabrieksgarantie",
      installatietijd: "2 - 3 uur",
      installatieInbegrepen: true,
      beschermingsgraad: "IP54",
      afmetingen: "256 × 193 × 106 mm",
    },
    vanafPrijs: 1195,
    geschiktVoor: ["particulier"],
    badges: ["Bestseller"],
    faqs: [
      {
        vraag: "Hoeveel Easee-laders kan ik thuis koppelen?",
        antwoord:
          "Thuis kunnen tot 3 Charge Up-laders op één groep samenwerken. Via Easee Link (868 MHz radio) verdelen ze automatisch het beschikbare vermogen en de fasen.",
      },
      {
        vraag: "Werkt de Charge Up ook zonder WiFi?",
        antwoord: "Ja, de lader heeft ingebouwd 4G (LTE Cat-M1) en blijft daarmee altijd verbonden met de Easee-cloud, ook zonder WiFi.",
      },
      {
        vraag: "Kan ik op zonne-energie laden?",
        antwoord: "Ja, via de Easee-app koppelt u de lader aan uw zonnepanelen en laadt u op zelf opgewekte stroom.",
      },
    ],
    downloads: STANDAARD_DOWNLOADS("Easee", "Charge Up"),
    gerelateerd: ["easee/charge-max", "zaptec/go", "ratio/solar-rfid"],
    imageExt: "svg",
  },
  {
    merkSlug: "easee",
    productSlug: "charge-max",
    model: "Charge Max",
    tagline: "Thuislader met MID-meter — klaar voor correcte kostenverrekening.",
    beschrijving:
      "De Easee Charge Max voegt een MID-gecertificeerde energiemeter (klasse B, EN 50470-3) toe aan het bewezen Easee-platform. Ideaal voor wie laadkosten declareert bij de werkgever of gewoon exact inzicht wil — met dynamische load- en fasebalancering en 5 jaar garantie.",
    voordelen: [
      "Ingebouwde MID-gecertificeerde meter (klasse B, ±1%)",
      "Tot 22 kW laadvermogen, dynamische load- en fasebalancering",
      "Ingebouwde RFID/NFC-lezer",
      "WiFi, Bluetooth én ingebouwd 4G (LTE Cat-M1)",
      "Slagvast IK10-gecertificeerd",
      "5 jaar fabrieksgarantie",
    ],
    specs: {
      vermogenKw: 22,
      vermogenLabel: "22 kW (3-fase) / 7,4 kW (1-fase)",
      fase: "1- of 3-fase",
      kabel: "los",
      kabellengteM: null,
      rfid: true,
      loadBalancing: true,
      dynamicLoadBalancing: true,
      midMeter: true,
      app: true,
      connectiviteit: ["wifi", "bluetooth", "4g"],
      garantieJaren: 5,
      garantieLabel: "5 jaar fabrieksgarantie",
      installatietijd: "2 - 3 uur",
      installatieInbegrepen: true,
      beschermingsgraad: "IP54",
      afmetingen: "256 × 193 × 106 mm",
    },
    vanafPrijs: 1445,
    geschiktVoor: ["particulier", "zakelijk"],
    badges: [],
    faqs: [
      {
        vraag: "Voor wie is de Charge Max bedoeld?",
        antwoord:
          "Voor iedereen die laadkosten wil declareren of doorberekenen: de MID-gekeurde meter levert wettelijk erkende kWh-waarden, geschikt voor verrekening met werkgever of huurder.",
      },
      {
        vraag: "Wat is het verschil met de Charge Up?",
        antwoord: "De Charge Max heeft een ingebouwde MID-gecertificeerde meter; verder delen beide laders hetzelfde platform, dezelfde app en 5 jaar garantie.",
      },
    ],
    downloads: STANDAARD_DOWNLOADS("Easee", "Charge Max"),
    gerelateerd: ["easee/charge-up", "easee/charge-core", "alfen/eve-single-pro-line"],
    imageExt: "svg",
  },
  {
    merkSlug: "easee",
    productSlug: "charge-core",
    model: "Charge Core",
    tagline: "Schaalbaar laden voor VvE, kantoor en parkeergarage.",
    beschrijving:
      "De Easee Charge Core is ontworpen voor grootschalige locaties: appartementencomplexen, kantoren en parkeerterreinen. Dankzij daisy chaining en het Easee Ready-systeem zijn tot 101 laders per circuit voordelig te installeren, met dynamische load- en fasebalancering over de hele locatie.",
    voordelen: [
      "Tot 101 laadpunten per circuit — ongekend schaalbaar",
      "Daisy chaining: lage installatiekosten per extra laadpunt",
      "Dynamische load- en fasebalancering over de hele site",
      "Ingebouwde RFID/NFC-lezer en diefstalbeveiliging",
      "Remote beheer via de Easee-cloud",
      "5 jaar fabrieksgarantie",
    ],
    specs: {
      vermogenKw: 22,
      vermogenLabel: "22 kW (3-fase) / 7,4 kW (1-fase)",
      fase: "1- of 3-fase",
      kabel: "los",
      kabellengteM: null,
      rfid: true,
      loadBalancing: true,
      dynamicLoadBalancing: true,
      midMeter: false,
      app: true,
      connectiviteit: ["wifi", "bluetooth", "4g"],
      garantieJaren: 5,
      garantieLabel: "5 jaar fabrieksgarantie",
      installatietijd: "3 uur per laadpunt",
      installatieInbegrepen: true,
      beschermingsgraad: "IP54",
      afmetingen: "256 × 193 × 106 mm",
    },
    vanafPrijs: 1395,
    geschiktVoor: ["zakelijk", "vve"],
    badges: [],
    faqs: [
      {
        vraag: "Waarom is de Charge Core geschikt voor VvE's?",
        antwoord:
          "Het Easee Ready-systeem maakt de basisinfrastructuur eenmalig gereed, waarna extra laadpunten zeer voordelig bijgeplaatst worden. Het systeem verdeelt de beschikbare stroom dynamisch over alle actieve laadpunten.",
      },
      {
        vraag: "Heeft de Charge Core een MID-meter?",
        antwoord:
          "Nee. Voor wettelijk gecertificeerde meting per laadpunt (directe facturatie) biedt Easee de Charge Pro. Wij adviseren graag welke variant bij uw situatie past.",
      },
    ],
    downloads: STANDAARD_DOWNLOADS("Easee", "Charge Core"),
    gerelateerd: ["alfen/eve-double-pro-line", "zaptec/pro", "easee/charge-max"],
    imageExt: "svg",
  },

  // ───────────────────────── Wallbox ─────────────────────────
  {
    merkSlug: "wallbox",
    productSlug: "pulsar-plus",
    model: "Pulsar Plus",
    tagline: "Een van de kleinste slimme laders — bewezen en betaalbaar.",
    beschrijving:
      "De Wallbox Pulsar Plus is wereldwijd een van de populairste thuisladers: zeer compact (166×163×82 mm), krachtig tot 22 kW en slim dankzij de myWallbox-app. Met Power Boost laadt u maximaal zonder ooit uw hoofdaansluiting te overbelasten.",
    voordelen: [
      "Zeer compact: 166 × 163 × 82 mm, slechts 1 kg",
      "Leverbaar in 7,4, 11 en 22 kW uitvoeringen",
      "Power Boost: dynamisch laden op basis van uw huisverbruik (met meetmodule)",
      "Power Sharing voor meerdere Pulsar-laders",
      "myWallbox-app met statistieken, planning en zonneladen",
      "Vaste kabel van 5 m (7 m optioneel) of socket-versie",
    ],
    specs: {
      vermogenKw: 22,
      vermogenLabel: "7,4 / 11 / 22 kW (1- of 3-fase)",
      fase: "1- of 3-fase",
      kabel: "vast of los",
      kabellengteM: 5,
      rfid: false,
      loadBalancing: true,
      dynamicLoadBalancing: true,
      midMeter: false,
      app: true,
      connectiviteit: ["wifi", "bluetooth"],
      garantieJaren: 3,
      garantieLabel: "3 jaar fabrieksgarantie",
      installatietijd: "2 - 3 uur",
      installatieInbegrepen: true,
      beschermingsgraad: "IP54",
      afmetingen: "166 × 163 × 82 mm",
    },
    vanafPrijs: 999,
    geschiktVoor: ["particulier"],
    badges: ["Compact"],
    faqs: [
      {
        vraag: "Wat is Power Boost?",
        antwoord:
          "Power Boost meet (via een optionele energiemeter) het actuele verbruik van uw woning en past het laadvermogen realtime aan, zodat de hoofdzekering nooit overbelast raakt.",
      },
      {
        vraag: "Kan de Pulsar Plus echt 22 kW laden?",
        antwoord:
          "Ja, de 22 kW-uitvoering op een 3-fase aansluiting. Let op: veel auto's laden thuis maximaal 11 kW — wij adviseren bij de offerte welke uitvoering zinvol is.",
      },
    ],
    downloads: STANDAARD_DOWNLOADS("Wallbox", "Pulsar Plus"),
    gerelateerd: ["wallbox/pulsar-max", "zaptec/go", "ratio/start"],
    imageExt: "svg",
  },
  {
    merkSlug: "wallbox",
    productSlug: "pulsar-max",
    model: "Pulsar Max",
    tagline: "De robuustere Pulsar met IK10 en 5 jaar garantie.",
    beschrijving:
      "De Wallbox Pulsar Max bouwt voort op het succes van de Pulsar Plus, met een extra robuuste IK10-behuizing, verbeterde koeling en 5 jaar garantie. Dezelfde compacte vorm en slimme myWallbox-functies, klaar voor jarenlang intensief gebruik.",
    voordelen: [
      "Slagvaste IK10-behuizing, weerbestendig",
      "5 jaar fabrieksgarantie",
      "Leverbaar in 7,4, 11 en 22 kW uitvoeringen",
      "Power Boost en Dynamic Power Sharing ondersteund",
      "myWallbox-app met zonneladen en laadplanning",
      "Vaste kabel 5 m (7 m optioneel) of socket-versie",
    ],
    specs: {
      vermogenKw: 22,
      vermogenLabel: "7,4 / 11 / 22 kW (1- of 3-fase)",
      fase: "1- of 3-fase",
      kabel: "vast of los",
      kabellengteM: 5,
      rfid: false,
      loadBalancing: true,
      dynamicLoadBalancing: true,
      midMeter: false,
      app: true,
      connectiviteit: ["wifi", "bluetooth"],
      garantieJaren: 5,
      garantieLabel: "5 jaar fabrieksgarantie",
      installatietijd: "2 - 3 uur",
      installatieInbegrepen: true,
      beschermingsgraad: "IP54",
      afmetingen: "198 × 201 × 99 mm",
    },
    vanafPrijs: 1145,
    geschiktVoor: ["particulier"],
    badges: [],
    faqs: [
      {
        vraag: "Wat is het verschil tussen Pulsar Plus en Pulsar Max?",
        antwoord:
          "De Pulsar Max heeft een robuustere IK10-behuizing, een ruimer werktemperatuurbereik en 5 jaar garantie (tegenover 3 jaar bij de Pulsar Plus). De slimme functies zijn gelijk.",
      },
    ],
    downloads: STANDAARD_DOWNLOADS("Wallbox", "Pulsar Max"),
    gerelateerd: ["wallbox/pulsar-plus", "wallbox/pulsar-pro", "easee/charge-up"],
    imageExt: "svg",
  },
  {
    merkSlug: "wallbox",
    productSlug: "pulsar-pro",
    model: "Pulsar Pro",
    tagline: "De zakelijke Pulsar: RFID, 4G en tot 50 laders op één circuit.",
    beschrijving:
      "De Wallbox Pulsar Pro is ontworpen voor appartementen, kantoren en wagenparken. Met RFID-toegang, 4G-connectiviteit, OCPP en Dynamic Power Sharing verdeelt hij het beschikbare vermogen automatisch over maximaal 50 laders op één circuit.",
    voordelen: [
      "RFID-toegangscontrole voor meerdere gebruikers",
      "Dynamic Power Sharing tot 50 laders op één circuit",
      "4G-connectiviteit voor beheer op afstand",
      "OCPP voor koppeling met laadbeheerplatformen",
      "Optionele externe MID-meting voor verrekening",
      "Compact: 198 × 201 × 99 mm",
    ],
    specs: {
      vermogenKw: 22,
      vermogenLabel: "7,4 / 22 kW (1- of 3-fase)",
      fase: "1- of 3-fase",
      kabel: "vast",
      kabellengteM: 5,
      rfid: true,
      loadBalancing: true,
      dynamicLoadBalancing: true,
      midMeter: false,
      app: true,
      connectiviteit: ["wifi", "bluetooth", "ethernet", "4g"],
      garantieJaren: 3,
      garantieLabel: "3 jaar fabrieksgarantie",
      installatietijd: "3 uur",
      installatieInbegrepen: true,
      beschermingsgraad: "IP54",
      afmetingen: "198 × 201 × 99 mm",
    },
    vanafPrijs: 1545,
    geschiktVoor: ["zakelijk", "vve"],
    badges: [],
    faqs: [
      {
        vraag: "Hoeveel Pulsar Pro-laders kan ik koppelen?",
        antwoord:
          "Dynamic Power Sharing verdeelt het beschikbare vermogen van het gebouw automatisch over maximaal 50 gekoppelde laders op één circuit.",
      },
      {
        vraag: "Is MID-meting mogelijk voor facturatie?",
        antwoord: "Ja, via een optionele externe MID-gecertificeerde meter per lader kunnen laadsessies wettelijk correct worden verrekend.",
      },
    ],
    downloads: STANDAARD_DOWNLOADS("Wallbox", "Pulsar Pro"),
    gerelateerd: ["wallbox/pulsar-max", "easee/charge-core", "zaptec/pro"],
    imageExt: "svg",
  },

  // ───────────────────────── Zaptec ─────────────────────────
  {
    merkSlug: "zaptec",
    productSlug: "go",
    model: "Zaptec Go",
    tagline: "Bekroond Noors design, tot 22 kW en 5 jaar garantie.",
    beschrijving:
      "De Zaptec Go is een van de meest geliefde thuisladers van Europa: minimalistisch design van slechts 1,3 kg, laadvermogen tot 22 kW, RFID-toegang en automatische software-updates via de cloud. Standaard met 5 jaar garantie.",
    voordelen: [
      "Tot 22 kW (3-fase) of 7,4 kW (1-fase)",
      "Compact en licht: 242 × 180 × 75 mm, 1,3 kg",
      "RFID-lezer voor toegangscontrole",
      "WiFi, Bluetooth én 4G (LTE Cat-M1)",
      "OCPP 1.6J koppeling via de cloud",
      "5 jaar fabrieksgarantie",
    ],
    specs: {
      vermogenKw: 22,
      vermogenLabel: "22 kW (3-fase) / 7,4 kW (1-fase)",
      fase: "1- of 3-fase",
      kabel: "los",
      kabellengteM: null,
      rfid: true,
      loadBalancing: true,
      dynamicLoadBalancing: true,
      midMeter: false,
      app: true,
      connectiviteit: ["wifi", "bluetooth", "4g"],
      garantieJaren: 5,
      garantieLabel: "5 jaar fabrieksgarantie",
      installatietijd: "2 - 3 uur",
      installatieInbegrepen: true,
      beschermingsgraad: "IP54",
      afmetingen: "242 × 180 × 75 mm",
    },
    vanafPrijs: 1095,
    geschiktVoor: ["particulier", "vve"],
    badges: [],
    faqs: [
      {
        vraag: "Heeft de Zaptec Go een vaste laadkabel?",
        antwoord: "Nee, de Zaptec Go heeft een type 2 stopcontact waarop u uw eigen laadkabel aansluit — flexibel en hygiënisch bij meerdere gebruikers.",
      },
      {
        vraag: "Ondersteunt de Zaptec Go dynamic load balancing?",
        antwoord:
          "Ja, in combinatie met Zaptec Sense meet het systeem het actuele huisverbruik en past het laadvermogen dynamisch aan. Meerdere Zaptec-laders balanceren onderling automatisch.",
      },
    ],
    downloads: STANDAARD_DOWNLOADS("Zaptec", "Zaptec Go"),
    gerelateerd: ["zaptec/go-2", "easee/charge-up", "wallbox/pulsar-plus"],
    imageExt: "svg",
  },
  {
    merkSlug: "zaptec",
    productSlug: "go-2",
    model: "Zaptec Go 2",
    tagline: "De nieuwste generatie: MID-meter, display en klaar voor V2G.",
    beschrijving:
      "De Zaptec Go 2 (gelanceerd 2025) is gebouwd op het MID-gecertificeerde fundament van de Zaptec Pro. Met ingebouwd display, automatische 1/3-fase omschakeling, native OCPP, ingebouwd 4G en hardware die is voorbereid op bidirectioneel laden (V2G).",
    voordelen: [
      "MID-gecertificeerde meter met ingebouwd display",
      "Automatische omschakeling 1-fase (7,4 kW) / 3-fase (22 kW)",
      "Hardware voorbereid op V2G (bidirectioneel laden, ISO 15118)",
      "Native OCPP en ingebouwd 4G LTE",
      "RFID-toegang (via Zaptec RFID Key)",
      "Slagvast IK10, 5 jaar garantie",
    ],
    specs: {
      vermogenKw: 22,
      vermogenLabel: "22 kW (3-fase) / 7,4 kW (1-fase), automatisch schakelend",
      fase: "1- of 3-fase",
      kabel: "los",
      kabellengteM: null,
      rfid: true,
      loadBalancing: true,
      dynamicLoadBalancing: true,
      midMeter: true,
      app: true,
      connectiviteit: ["wifi", "bluetooth", "4g"],
      garantieJaren: 5,
      garantieLabel: "5 jaar fabrieksgarantie",
      installatietijd: "2 - 3 uur",
      installatieInbegrepen: true,
      beschermingsgraad: "IP54",
      afmetingen: "240 × 180 × 106 mm",
    },
    vanafPrijs: 1295,
    geschiktVoor: ["particulier", "zakelijk"],
    badges: ["Nieuw"],
    faqs: [
      {
        vraag: "Wat is het verschil tussen de Zaptec Go en Go 2?",
        antwoord:
          "De Go 2 voegt een MID-gecertificeerde meter met display toe, schakelt automatisch tussen 1- en 3-fase, ondersteunt native OCPP en is hardwarematig voorbereid op bidirectioneel laden (V2G).",
      },
      {
        vraag: "Wat betekent 'klaar voor V2G'?",
        antwoord:
          "De hardware ondersteunt de ISO 15118-standaard voor bidirectioneel laden. Zodra auto's en netbeheerders dit ondersteunen, kan de Go 2 energie uit uw auto teruggeven aan huis of net.",
      },
    ],
    downloads: STANDAARD_DOWNLOADS("Zaptec", "Zaptec Go 2"),
    gerelateerd: ["zaptec/go", "zaptec/pro", "easee/charge-max"],
    imageExt: "svg",
  },
  {
    merkSlug: "zaptec",
    productSlug: "pro",
    model: "Zaptec Pro",
    tagline: "Het professionele laadsysteem voor VvE's en bedrijven.",
    beschrijving:
      "De Zaptec Pro is ontworpen voor gedeelde en commerciële laadlocaties. Dynamische load- én fasebalancering verdeelt het beschikbare vermogen naadloos over alle voertuigen, met MID klasse B-meting per laadpunt en connectiviteit via WiFi, PLC of 4G.",
    voordelen: [
      "Dynamische load- en fasebalancering over alle laadpunten",
      "Automatisch schakelen tussen 1- en 3-fase laden",
      "MID klasse B-gecertificeerde meter met kWh-display",
      "RFID-toegang en OCPP-koppeling",
      "Altijd online via WiFi, PLC of 4G (LTE Cat-M1)",
      "5 jaar fabrieksgarantie",
    ],
    specs: {
      vermogenKw: 22,
      vermogenLabel: "tot 22 kW per laadpunt (1- of 3-fase)",
      fase: "1- of 3-fase",
      kabel: "los",
      kabellengteM: null,
      rfid: true,
      loadBalancing: true,
      dynamicLoadBalancing: true,
      midMeter: true,
      app: true,
      connectiviteit: ["wifi", "ethernet", "4g"],
      garantieJaren: 5,
      garantieLabel: "5 jaar fabrieksgarantie",
      installatietijd: "4 - 5 uur",
      installatieInbegrepen: true,
      beschermingsgraad: "IP54",
      afmetingen: "392 × 258 × 112 mm",
    },
    vanafPrijs: 1795,
    geschiktVoor: ["zakelijk", "vve"],
    badges: [],
    faqs: [
      {
        vraag: "Hoeveel Zaptec Pro-laadpunten kan ik koppelen?",
        antwoord:
          "Het Zaptec-systeem is ontworpen voor grote installaties: tientallen laadpunten delen automatisch het beschikbare vermogen via dynamische load- en fasebalancering.",
      },
      {
        vraag: "Kan ik verbruik per bewoner of medewerker afrekenen?",
        antwoord:
          "Ja. Elke Zaptec Pro heeft een MID klasse B-gecertificeerde meter en koppelt via OCPP met verrekenplatformen voor automatische facturatie per RFID-pas.",
      },
    ],
    downloads: STANDAARD_DOWNLOADS("Zaptec", "Zaptec Pro"),
    gerelateerd: ["zaptec/go-2", "alfen/eve-double-pro-line", "easee/charge-core"],
    imageExt: "svg",
  },
];

export function getProductsByBrand(merkSlug: string): Product[] {
  return PRODUCTS.filter((p) => p.merkSlug === merkSlug.toLowerCase());
}

export function getProduct(merkSlug: string, productSlug: string): Product | undefined {
  return PRODUCTS.find(
    (p) => p.merkSlug === merkSlug.toLowerCase() && p.productSlug === productSlug.toLowerCase(),
  );
}

/** Zoekt een product op basis van een "merk/product"-referentie, zoals gebruikt in `gerelateerd`. */
export function getProductByRef(ref: string): Product | undefined {
  const [merkSlug, productSlug] = ref.split("/");
  return getProduct(merkSlug, productSlug);
}

export function fullSlug(p: Product): string {
  return `${p.merkSlug}/${p.productSlug}`;
}
