/**
 * Voorbeeldsituaties: representatieve installatiescenario's die laten zien hoe een
 * traject verloopt en welke techniek daarbij komt kijken.
 *
 * Dit zijn nadrukkelijk GEEN klantcases. Er staan bewust geen klantnamen, plaatsen,
 * data of behaalde resultaten in: die zijn alleen toegestaan als ze herleidbaar zijn
 * tot een echte, verifieerbare opdracht. Zodra er geverifieerde referentieprojecten
 * beschikbaar zijn, kunnen die hier als aparte, gelabelde cases aan worden toegevoegd.
 */
export type Project = {
  id: string;
  titel: string;
  subtitel: string;
  type: "Particulier" | "Zakelijk" | "VvE";
  woningType: string;
  laadpaal: string;
  laadpaalSlug: string;
  aantalLaadpunten: number;
  werkzaamheden: string[];
  installatieduur: string;
  uitdaging: string;
  oplossing: string;
  tags: string[];
  gradientFrom: string;
  gradientTo: string;
};

export const PROJECTEN: Project[] = [
  {
    id: "1",
    titel: "Twee laadpunten op een 1-fase aansluiting",
    subtitel: "Load balancing voorkomt overbelasting van de meterkast",
    type: "Particulier",
    woningType: "Vrijstaande woning",
    laadpaal: "Alfen Eve Single Pro-line",
    laadpaalSlug: "alfen/eve-single-pro-line",
    aantalLaadpunten: 2,
    werkzaamheden: [
      "Meterkastbeoordeling ter plaatse",
      "Kabeltracé bepalen en kabel trekken",
      "Twee laadpalen installeren met onderlinge load balancing",
      "Inregelen en testen",
      "Oplevering met documentatie en testrapport",
    ],
    installatieduur: "1 dag",
    uitdaging:
      "Twee elektrische auto's die tegelijk moeten kunnen laden, terwijl er maar een 1-fase aansluiting beschikbaar is. Zonder maatregelen zou de hoofdzekering bij gelijktijdig laden aanslaan.",
    oplossing:
      "Met load balancing verdelen de laadpalen het beschikbare vermogen automatisch over beide auto's. Het systeem houdt daarbij rekening met de rest van de installatie, zodat de meterkast nooit overbelast raakt.",
    tags: ["Load balancing", "1-fase", "Vrijstaand"],
    gradientFrom: "#0ea5e9",
    gradientTo: "#06b6d4",
  },
  {
    id: "2",
    titel: "Meerdere laadpunten voor een wagenpark",
    subtitel: "Dynamic load balancing op een bedrijfsterrein",
    type: "Zakelijk",
    woningType: "Bedrijfspand",
    laadpaal: "Alfen Eve Double Pro-line",
    laadpaalSlug: "alfen/eve-double-pro-line",
    aantalLaadpunten: 6,
    werkzaamheden: [
      "Meterkastbeoordeling en vermogensmeting",
      "Leidingwerk naar de parkeerplaatsen",
      "Laadpunten installeren met MID-meting per aansluiting",
      "Dynamic load balancing configureren",
      "Instructie voor de beheerder",
    ],
    installatieduur: "2 dagen",
    uitdaging:
      "Een wagenpark dat 's ochtends grotendeels gelijktijdig laadt, op een aansluiting die niet berekend is op het volledige gelijktijdige laadvermogen.",
    oplossing:
      "Dynamic load balancing meet doorlopend het actuele verbruik van het pand en verdeelt wat overblijft over de laadpunten. Door de MID-gekeurde meter per laadpunt kunnen laadkosten per gebruiker correct worden doorbelast.",
    tags: ["Dynamic load balancing", "Zakelijk", "MID-meter"],
    gradientFrom: "#8b5cf6",
    gradientTo: "#6366f1",
  },
  {
    id: "3",
    titel: "Laadinfrastructuur in een VvE-parkeergarage",
    subtitel: "Eerlijke verdeling van de beschikbare netcapaciteit",
    type: "VvE",
    woningType: "Appartementencomplex",
    laadpaal: "Zaptec Pro",
    laadpaalSlug: "zaptec/pro",
    aantalLaadpunten: 8,
    werkzaamheden: [
      "Adviesgesprek met het VvE-bestuur",
      "Capaciteitsberekening en ontwerp van de laadinfrastructuur",
      "Laadpunten installeren in de parkeergarage",
      "Load balancing over alle laadpunten configureren",
      "Gebruikers aanmaken en RFID-passen uitgeven",
    ],
    installatieduur: "2 – 3 dagen",
    uitdaging:
      "Een gedeelde parkeergarage waar meerdere bewoners willen laden, terwijl er één gezamenlijk aansluitvermogen beschikbaar is en de kosten per bewoner apart moeten worden afgerekend.",
    oplossing:
      "Het laadplatform verdeelt de beschikbare capaciteit over de actieve laadpunten. Iedere bewoner laadt met een eigen RFID-pas, waardoor het verbruik per gebruiker geregistreerd wordt en de VvE de kosten eerlijk kan verdelen.",
    tags: ["VvE", "Load balancing", "RFID"],
    gradientFrom: "#10b981",
    gradientTo: "#06b6d4",
  },
  {
    id: "4",
    titel: "Laden op eigen zonnestroom",
    subtitel: "De laadpaal volgt de opbrengst van de zonnepanelen",
    type: "Particulier",
    woningType: "Gezinswoning met zonnepanelen",
    laadpaal: "Easee Charge Up",
    laadpaalSlug: "easee/charge-up",
    aantalLaadpunten: 1,
    werkzaamheden: [
      "Meterkastbeoordeling",
      "Laadpaal installeren op de oprit",
      "Koppeling met de slimme meter voor verbruiksmeting",
      "App-configuratie voor laden op overschot van de zonnepanelen",
    ],
    installatieduur: "Halve dag",
    uitdaging:
      "Zoveel mogelijk laden op zelf opgewekte stroom in plaats van terug te leveren aan het net, zonder dat de auto blijft staan als de zon een dag niet schijnt.",
    oplossing:
      "De laadpaal laadt bij voorkeur op het overschot van de zonnepanelen. Is er te weinig zon, dan schakelt hij automatisch over naar laden in de daluren.",
    tags: ["Zonnepanelen", "Slim laden", "Solar"],
    gradientFrom: "#f59e0b",
    gradientTo: "#10b981",
  },
  {
    id: "5",
    titel: "Uitbreiding van een bestaande VvE-installatie",
    subtitel: "Extra laadpunten op een voorbereide infrastructuur",
    type: "VvE",
    woningType: "Appartementen met parkeergarage",
    laadpaal: "Easee Charge Core",
    laadpaalSlug: "easee/charge-core",
    aantalLaadpunten: 8,
    werkzaamheden: [
      "Audit van de bestaande laadinstallatie",
      "Bekabelingsinfrastructuur uitbreiden",
      "Extra laadpunten plaatsen en aanmelden",
      "Load balancing herconfigureren voor het volledige aantal laadpunten",
      "RFID-toegang uitbreiden naar nieuwe gebruikers",
    ],
    installatieduur: "2 dagen",
    uitdaging:
      "Een groeiend aantal bewoners met een elektrische auto, terwijl de bestaande installatie op een kleiner aantal laadpunten was ingericht.",
    oplossing:
      "Doordat de leidingweg en verdeelinrichting bij de eerste fase al zijn voorbereid op uitbreiding, kunnen extra laadpunten worden toegevoegd zonder de bestaande installatie open te breken.",
    tags: ["VvE", "Uitbreiding", "Modulair"],
    gradientFrom: "#ec4899",
    gradientTo: "#8b5cf6",
  },
  {
    id: "6",
    titel: "Laadpaal bij een appartement met eigen parkeerplaats",
    subtitel: "Van VvE-toestemming tot werkende laadpaal",
    type: "Particulier",
    woningType: "Appartement met privéparkeerplaats",
    laadpaal: "Wallbox Pulsar Plus",
    laadpaalSlug: "wallbox/pulsar-plus",
    aantalLaadpunten: 1,
    werkzaamheden: [
      "Beoordeling van de meterkastsituatie in het complex",
      "Installatieplan opstellen voor de VvE-aanvraag",
      "Kabel trekken vanuit de eigen meterkast",
      "Laadpaal installeren op de privéparkeerplaats",
      "Vermogensbegrenzing instellen op de beschikbare aansluiting",
    ],
    installatieduur: "Halve dag",
    uitdaging:
      "Bij een appartement is toestemming van de VvE nodig en loopt de voeding vanuit de eigen meterkast, die vaak beperkte ruimte heeft.",
    oplossing:
      "Wij stellen het installatieplan op dat de VvE nodig heeft voor de besluitvorming, en stemmen het laadvermogen af op wat de eigen aansluiting aankan.",
    tags: ["Appartement", "VvE-toestemming", "Compact"],
    gradientFrom: "#06b6d4",
    gradientTo: "#3b82f6",
  },
];
