export type ProjectReview = {
  naam: string;
  rating: number;
  quote: string;
};

export type Project = {
  id: string;
  titel: string;
  subtitel: string;
  plaats: string;
  provincie: string;
  type: "Particulier" | "Zakelijk" | "VvE";
  woningType: string;
  laadpaal: string;
  laadpaalSlug: string;
  automerk: string;
  aantalLaadpunten: number;
  werkzaamheden: string[];
  installatieduur: string;
  bijzonderheden: string;
  resultaat: string;
  review: ProjectReview;
  tags: string[];
  gradientFrom: string;
  gradientTo: string;
  datum: string;
};

export const PROJECTEN: Project[] = [
  {
    id: "1",
    titel: "Alfen Eve voor gezin met twee Tesla's",
    subtitel: "Load balancing op een 1-fase aansluiting",
    plaats: "Utrecht",
    provincie: "Utrecht",
    type: "Particulier",
    woningType: "Vrijstaande woning",
    laadpaal: "Alfen Eve Single Pro-line",
    laadpaalSlug: "alfen-eve-single-pro-line",
    automerk: "Tesla",
    aantalLaadpunten: 2,
    werkzaamheden: [
      "Meterkastbeoordeling ter plaatse",
      "Kabel trekken via de kruipruimte (12 meter)",
      "Twee Alfen Eve laadpalen installeren met load balancing",
      "Inregelen en testen",
      "Oplevering met documentatie",
    ],
    installatieduur: "1 dag",
    bijzonderheden:
      "De klant had slechts een 1-fase aansluiting beschikbaar, terwijl twee Tesla's gelijktijdig moesten kunnen laden. Met load balancing verdeelt het systeem het beschikbare vermogen automatisch, zodat nooit de meterkast overbelast raakt.",
    resultaat:
      "Beide Tesla's laden gelijktijdig zonder problemen. Totale laadtijd per voertuig bedraagt circa 6 uur op de 1-fase aansluiting — voldoende voor dagelijks gebruik.",
    review: {
      naam: "Familie de Vries",
      rating: 5,
      quote:
        "Binnen een week een laadpaal én duidelijk advies over load balancing. Top geregeld van begin tot eind. ClimateX dacht mee en gaf ons de beste oplossing voor onze situatie.",
    },
    tags: ["Load balancing", "Tesla", "Vrijstaand"],
    gradientFrom: "#0ea5e9",
    gradientTo: "#06b6d4",
    datum: "2024-03",
  },
  {
    id: "2",
    titel: "6 laadpunten voor zakelijk wagenpark",
    subtitel: "Dynamic load balancing op bedrijfsterrein",
    plaats: "Amsterdam",
    provincie: "Noord-Holland",
    type: "Zakelijk",
    woningType: "Bedrijfspand",
    laadpaal: "ABB Terra AC Wallbox",
    laadpaalSlug: "abb-terra-ac-wallbox",
    automerk: "Diverse merken",
    aantalLaadpunten: 6,
    werkzaamheden: [
      "Meterkastbeoordeling en vermogensmeting",
      "Leidingwerk naar parkeerplaatsen (40 meter)",
      "6 ABB Terra AC laadpalen installeren",
      "Dynamic load balancing configureren",
      "Koppeling met fleet management systeem",
      "Gebruikerstraining",
    ],
    installatieduur: "2 dagen",
    bijzonderheden:
      "Het bedrijf had een 3-fase aansluiting van 3 × 25A. Met dynamic load balancing kunnen alle 6 laadpunten gelijktijdig worden gebruikt zonder de aansluiting te overbelasten, ook tijdens piekmomenten in de ochtend.",
    resultaat:
      "Het volledige wagenpark van 6 elektrische voertuigen laadt nu op het eigen terrein. Kostenreductie van circa 40% ten opzichte van openbaar laden. Volledige integratie met de bestaande fleet management software.",
    review: {
      naam: "Logistiek Noord BV",
      rating: 5,
      quote:
        "ClimateX heeft 6 laadpunten op ons terrein geïnstalleerd met slimme verdeling. Werkt feilloos. Professionele aanpak en uitstekende nazorg.",
    },
    tags: ["Dynamic load balancing", "Zakelijk", "Fleet"],
    gradientFrom: "#8b5cf6",
    gradientTo: "#6366f1",
    datum: "2024-05",
  },
  {
    id: "3",
    titel: "VvE-oplossing voor 24 bewoners",
    subtitel: "Eerlijke laadverdeling in een appartementencomplex",
    plaats: "Rotterdam",
    provincie: "Zuid-Holland",
    type: "VvE",
    woningType: "Appartementencomplex",
    laadpaal: "Zaptec Go",
    laadpaalSlug: "zaptec-go",
    automerk: "Diverse merken",
    aantalLaadpunten: 8,
    werkzaamheden: [
      "Adviesgesprek met de VvE-bestuur",
      "Capaciteitsberekening en ontwerp laadinfrastructuur",
      "8 Zaptec Go laadpalen installeren in parkeergarage",
      "Zaptec Pro load balancing platform configureren",
      "Gebruikers aanmaken en RFID-kaarten uitreiken",
      "Instructie voor beheerder en bewoners",
    ],
    installatieduur: "3 dagen",
    bijzonderheden:
      "De VvE had een gezamenlijk aansluitvermogen van 3 × 63A beschikbaar voor de parkeergarage. Via het Zaptec Pro platform verdeelt het systeem de laadcapaciteit eerlijk over alle 24 bewoners met een laadpas, ongeacht welke 8 laadpunten tegelijk worden gebruikt.",
    resultaat:
      "Alle bewoners kunnen thuis laden met hun eigen RFID-pas. Het systeem rapporteert het energieverbruik per bewoner voor eerlijke kostenverdeling. De VvE-vergadering heeft unaniem positief gestemd over de samenwerking.",
    review: {
      naam: "VvE De Hoek",
      rating: 5,
      quote:
        "Eerlijke verdeling van laadcapaciteit voor alle bewoners, prettig en transparant traject. ClimateX heeft alles tot in de puntjes geregeld en was altijd bereikbaar.",
    },
    tags: ["VvE", "Zaptec", "Load balancing"],
    gradientFrom: "#10b981",
    gradientTo: "#06b6d4",
    datum: "2024-06",
  },
  {
    id: "4",
    titel: "Smappee voor zonnepanelen-eigenaar",
    subtitel: "Laden op zonne-energie met dynamisch tarief",
    plaats: "Eindhoven",
    provincie: "Noord-Brabant",
    type: "Particulier",
    woningType: "Gezinswoning",
    laadpaal: "Smappee EV Wall Business",
    laadpaalSlug: "smappee-ev-wall-business",
    automerk: "Volkswagen ID.4",
    aantalLaadpunten: 1,
    werkzaamheden: [
      "Meterkastbeoordeling",
      "Smappee EV Wall installeren op de oprit",
      "Smappee Infinity gateway koppelen met bestaande zonnepanelen",
      "App-configuratie voor slim laden op zonnestroom",
    ],
    installatieduur: "Halve dag",
    bijzonderheden:
      "De klant had al 12 zonnepanelen en wilde zijn Volkswagen ID.4 laden met zelf opgewekte stroom. Via de Smappee-app laadt de auto alleen wanneer er voldoende zon is, of automatisch in daluren als zonne-energie onvoldoende is.",
    resultaat:
      "Jaarlijkse besparing van circa € 1.400 ten opzichte van openbaar laden. Meer dan 70% van de laadsessies vindt nu plaats op eigen zonne-energie. Terugverdientijd laadpaal: minder dan 14 maanden.",
    review: {
      naam: "Familie Janssen",
      rating: 5,
      quote:
        "Fantastische installatie en geweldig dat we nu op eigen stroom rijden. De Smappee-app geeft ons alle inzicht. Binnen het uur was het geregeld.",
    },
    tags: ["Zonnepanelen", "Smappee", "Slim laden"],
    gradientFrom: "#f59e0b",
    gradientTo: "#10b981",
    datum: "2024-07",
  },
  {
    id: "5",
    titel: "Easee One voor VvE-uitbreiding",
    subtitel: "Fase 2: uitbreiding van 4 naar 12 laadpunten",
    plaats: "Den Haag",
    provincie: "Zuid-Holland",
    type: "VvE",
    woningType: "Appartementen met parkeergarage",
    laadpaal: "Easee One",
    laadpaalSlug: "easee-one",
    automerk: "Diverse merken",
    aantalLaadpunten: 8,
    werkzaamheden: [
      "Audit bestaande installatie (4 laadpalen fase 1)",
      "Uitbreiden bekabelingsinfrastructuur",
      "8 extra Easee One laadpalen installeren",
      "Easee ecosystem configureren voor 12 laadpunten",
      "RFID-kaarten uitbreiden naar nieuwe gebruikers",
    ],
    installatieduur: "2 dagen",
    bijzonderheden:
      "Dankzij de modulaire Easee-infrastructuur uit fase 1 (uitgevoerd door ClimateX, 2023) was uitbreiden eenvoudig. De bestaande leidingweg en verdeelinrichting waren al voorbereid op 12 laadpunten.",
    resultaat:
      "12 laadpunten actief voor 60 bewoners op rotatiebasis. Geen technische storingen in de eerste 6 maanden na oplevering. VvE overweegt fase 3 met nog eens 8 laadpunten.",
    review: {
      naam: "VvE Parkzicht",
      rating: 5,
      quote:
        "ClimateX had bij fase 1 al rekening gehouden met uitbreiding. Fase 2 was daardoor razendsnel klaar. Dat is pas echt meedenken.",
    },
    tags: ["VvE", "Easee", "Uitbreiding"],
    gradientFrom: "#ec4899",
    gradientTo: "#8b5cf6",
    datum: "2024-09",
  },
  {
    id: "6",
    titel: "Wallbox Pulsar Plus op appartementencomplex",
    subtitel: "Slimme laadpaal voor bijzondere meterkastsituatie",
    plaats: "Haarlem",
    provincie: "Noord-Holland",
    type: "Particulier",
    woningType: "Appartement (begane grond)",
    laadpaal: "Wallbox Pulsar Plus",
    laadpaalSlug: "wallbox-pulsar-plus",
    automerk: "Kia EV6",
    aantalLaadpunten: 1,
    werkzaamheden: [
      "Beoordeling meterkastsituatie appartementencomplex",
      "Overleg met VvE bestuur voor toestemming",
      "Kabel trekken vanuit eigen meterkast (16 meter)",
      "Wallbox Pulsar Plus installeren op privé-parkeerplaats",
      "Power Boost configureren voor veilig laden",
    ],
    installatieduur: "Halve dag",
    bijzonderheden:
      "Bij appartementen is altijd toestemming van de VvE vereist. ClimateX heeft het aanvraagtraject begeleid en het installatieplan opgesteld dat door de VvE is goedgekeurd. Dankzij Power Boost kan de klant veilig laden zonder de gezamenlijke meterkast te overbelasten.",
    resultaat:
      "Eerste bewoner in dit complex met een eigen laadpaal. Inmiddels hebben 3 andere bewoners ook een offerte aangevraagd via de VvE.",
    review: {
      naam: "Dhr. Koopman",
      rating: 5,
      quote:
        "Ik had gehoord dat een laadpaal bij een appartement ingewikkeld zou zijn. ClimateX regelde alles met de VvE en installeerde binnen twee weken. Geweldig.",
    },
    tags: ["Appartement", "Wallbox", "VvE-toestemming"],
    gradientFrom: "#06b6d4",
    gradientTo: "#3b82f6",
    datum: "2024-10",
  },
];
