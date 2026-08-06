import type { Artikel } from "./types";

/** Datum waarop de subsidie- en regelgevingsinformatie is geverifieerd bij de bron. */
const GECONTROLEERD = "2026-08-05";

const BRON_SPRILA = {
  titel: "Subsidieregeling Private Laadinfrastructuur bij bedrijven (SPRILA)",
  organisatie: "RVO",
  url: "https://www.rvo.nl/subsidies-financiering/laadinfrastructuur/sprila-aanschaf",
};

const BRON_SVVE = {
  titel: "SVVE: subsidie voor oplaadpuntenadvies en basislaadinfrastructuur",
  organisatie: "RVO",
  url: "https://www.rvo.nl/subsidies-financiering/svve/oplaadpuntenadvies-basislaadinfrastructuur",
};

const BRON_VVE_TOESTEMMING = {
  titel: "Heb ik toestemming nodig van de VvE voor een laadpaal voor mijn elektrische auto?",
  organisatie: "Rijksoverheid",
  url: "https://www.rijksoverheid.nl/onderwerpen/huis-kopen/vraag-en-antwoord/toestemming-vve-laadpaal",
};

const BRON_MILIEUCENTRAAL_LADEN = {
  titel: "Opladen elektrische auto",
  organisatie: "Milieu Centraal",
  url: "https://www.milieucentraal.nl/duurzaam-vervoer/elektrische-auto/opladen-elektrische-auto/",
};

export const ARTIKELEN: Artikel[] = [
  // ───────────────────────── Subsidie & regels ─────────────────────────
  {
    slug: "subsidie-laadpaal",
    titel: "Subsidie voor een laadpaal: wat kan wel en wat niet",
    categorie: "Subsidie & regels",
    samenvatting:
      "Voor bedrijven en VvE's bestaan landelijke subsidieregelingen. Voor particulieren thuis is er géén landelijke subsidie. Dit staat er precies in de officiële regelingen.",
    leestijd: 5,
    secties: [
      {
        kop: "Particulier: geen landelijke subsidie",
        blokken: [
          {
            type: "alinea",
            tekst:
              "Voor het plaatsen van een laadpaal bij een particuliere woning bestaat geen landelijke subsidieregeling. De landelijke regelingen die er zijn, richten zich op bedrijven (SPRILA) en op VvE's en wooncoöperaties (SVVE).",
          },
          {
            type: "alinea",
            tekst:
              "Wel bieden sommige gemeenten een eigen regeling aan. De voorwaarden verschillen per gemeente; soms geldt als eis dat de laadpaal ook door anderen te gebruiken is. Informeer hiervoor bij uw eigen gemeente.",
          },
        ],
      },
      {
        kop: "Zakelijk: SPRILA",
        blokken: [
          {
            type: "alinea",
            tekst:
              "De Subsidieregeling Private Laadinfrastructuur bij bedrijven (SPRILA) ondersteunt ondernemers die laadinfrastructuur aanleggen op eigen of gehuurd terrein. De regeling is bedoeld voor bij de KVK ingeschreven ondernemingen — particulieren komen niet in aanmerking.",
          },
          {
            type: "lijst",
            items: [
              "Aanvraagperiode: 20 januari 2026 (09:00 uur) tot en met 18 december 2026 (12:00 uur)",
              "Minimaal vermogen: AC-laadstations vanaf 11 kW, of DC-laadstations vanaf 20 kW",
              "Staatssteunpercentages: 20% voor grote ondernemingen en 40% voor het mkb",
              "De laadinfrastructuur moet na goedkeuring minimaal 24 maanden privaat blijven, dus niet openbaar toegankelijk",
            ],
          },
          {
            type: "kader",
            titel: "Let op",
            tekst:
              "De hoogte van het subsidiebedrag hangt af van het type laadstation en het vermogen. Raadpleeg voor de actuele bedragen en de volledige voorwaarden altijd de officiële RVO-pagina; wij nemen hier bewust geen bedragen per laadstation over omdat die per categorie verschillen.",
          },
        ],
      },
      {
        kop: "VvE en wooncoöperatie: SVVE",
        blokken: [
          {
            type: "alinea",
            tekst:
              "Via de SVVE kunnen Verenigingen van Eigenaars, woonverenigingen en wooncoöperaties met een eigen parkeergelegenheid naast de woningen subsidie krijgen voor oplaadpuntenadvies en voor basislaadinfrastructuur. Verenigingen die alléén een parkeerterrein beheren, kunnen geen aanvraag doen.",
          },
          {
            type: "lijst",
            items: [
              "Oplaadpuntenadvies: 75% van de advieskosten inclusief btw, met een maximum van € 1.500 — eenmalig per vereniging",
              "Basislaadinfrastructuur: € 100 subsidie per parkeerplaats waar de infrastructuur daadwerkelijk wordt aangelegd",
              "De regeling loopt van 1 januari 2024 tot en met 31 december 2027",
              "Er moet ten minste één koopwoning aan de parkeergelegenheid gekoppeld zijn",
              "Het adviesrapport mag maximaal 2 jaar oud zijn en moet een prognose van de laadbehoefte voor 10 jaar bevatten",
            ],
          },
          {
            type: "alinea",
            tekst:
              "Voor de basislaadinfrastructuur is onder meer een ondertekende offerte nodig waarin de componenten staan benoemd, een bewijs van eigendom van de parkeergelegenheid en besluitvorming van de algemene ledenvergadering.",
          },
        ],
      },
    ],
    faqs: [
      {
        vraag: "Kan ik als particulier subsidie krijgen voor een laadpaal thuis?",
        antwoord:
          "Er is geen landelijke subsidieregeling voor een laadpaal bij een particuliere woning. Sommige gemeenten hebben een eigen regeling met eigen voorwaarden — informeer daarvoor bij uw gemeente.",
      },
      {
        vraag: "Komt mijn bedrijf in aanmerking voor SPRILA?",
        antwoord:
          "SPRILA is bedoeld voor bij de KVK ingeschreven ondernemingen die laadinfrastructuur aanleggen op eigen of gehuurd terrein. Het laadstation moet minimaal 11 kW (AC) of 20 kW (DC) leveren en de infrastructuur moet minstens 24 maanden privaat blijven.",
      },
      {
        vraag: "Mag onze VvE de subsidie voor oplaadpuntenadvies vaker aanvragen?",
        antwoord:
          "Nee. De subsidie voor oplaadpuntenadvies kan eenmalig per vereniging worden aangevraagd en bedraagt 75% van de advieskosten inclusief btw, met een maximum van € 1.500.",
      },
    ],
    bronnen: [BRON_SPRILA, BRON_SVVE],
    gecontroleerdOp: GECONTROLEERD,
    gerelateerd: ["laadpaal-vve", "load-balancing"],
  },

  // ───────────────────────── Zakelijk & VvE ─────────────────────────
  {
    slug: "laadpaal-vve",
    titel: "Laadpaal bij een VvE: toestemming, techniek en kosten",
    categorie: "Zakelijk & VvE",
    samenvatting:
      "Bij een appartement met gedeelde parkeergarage komt meer kijken dan bij een eigen oprit. Wat zegt de regelgeving, en hoe verdeelt u capaciteit en kosten eerlijk?",
    leestijd: 5,
    secties: [
      {
        kop: "Toestemming van de VvE is nodig",
        blokken: [
          {
            type: "alinea",
            tekst:
              "Voor de aanleg van een oplaadpunt voor een elektrische auto heeft u toestemming nodig van de Vereniging van Eigenaars. De VvE bepaalt ook de voorwaarden die aan die toestemming verbonden worden. Dat geldt ook wanneer de parkeerplaats bij uw eigen appartement hoort.",
          },
          {
            type: "kader",
            titel: "Bereid het besluit goed voor",
            tekst:
              "Een aanvraag verloopt in de praktijk soepeler met een technisch plan: waar komt de laadpaal, hoe loopt de kabel, wat is het beschikbare vermogen en hoe wordt het verbruik afgerekend. Wij stellen dit plan op zodat het VvE-bestuur een onderbouwd besluit kan nemen.",
          },
        ],
      },
      {
        kop: "Eén aansluiting, meerdere gebruikers",
        blokken: [
          {
            type: "alinea",
            tekst:
              "Een parkeergarage heeft doorgaans één gezamenlijk aansluitvermogen. Zodra meerdere bewoners tegelijk willen laden, is dat vermogen de beperkende factor. Load balancing verdeelt de beschikbare capaciteit over de actieve laadpunten, zodat de aansluiting niet overbelast raakt.",
          },
          {
            type: "alinea",
            tekst:
              "Voor de kostenverdeling is registratie per gebruiker nodig. Met RFID-autorisatie laadt iedere bewoner met een eigen pas; een MID-gekeurde meter zorgt dat het geregistreerde verbruik ook wettelijk bruikbaar is voor doorbelasting.",
          },
        ],
      },
      {
        kop: "Denk vooruit bij de eerste fase",
        blokken: [
          {
            type: "alinea",
            tekst:
              "Het aantal elektrische auto's in een complex groeit meestal geleidelijk. Door bij de eerste aanleg al rekening te houden met uitbreiding — ruimere leidingweg, voorbereide verdeelinrichting — kunnen latere laadpunten worden toegevoegd zonder de installatie open te breken.",
          },
        ],
      },
    ],
    faqs: [
      {
        vraag: "Mag de VvE een laadpaal weigeren?",
        antwoord:
          "De VvE moet toestemming geven en bepaalt de voorwaarden. Een goed onderbouwd technisch plan, waarin veiligheid, beschikbare capaciteit en kostenverdeling zijn uitgewerkt, vergroot de kans op een positief besluit.",
      },
      {
        vraag: "Hoe verdelen we de laadkosten eerlijk over de bewoners?",
        antwoord:
          "Door iedere gebruiker met een eigen RFID-pas te laten laden en het verbruik per laadpunt te meten. Voor doorbelasting is een MID-gekeurde meter van belang, omdat die een wettelijk correcte meting garandeert.",
      },
    ],
    bronnen: [BRON_VVE_TOESTEMMING, BRON_SVVE],
    gecontroleerdOp: GECONTROLEERD,
    gerelateerd: ["subsidie-laadpaal", "load-balancing", "mid-meter"],
  },

  // ───────────────────────── Techniek ─────────────────────────
  {
    slug: "1-fase-of-3-fase",
    titel: "1-fase of 3-fase laden: wat betekent het voor uw laadsnelheid",
    categorie: "Techniek",
    samenvatting:
      "Het type aansluiting in uw meterkast bepaalt hoe snel u thuis kunt laden. Zo werkt het verschil, en zo weet u wat u heeft.",
    leestijd: 4,
    secties: [
      {
        kop: "Het verschil in het kort",
        blokken: [
          {
            type: "alinea",
            tekst:
              "Bij een 1-fase aansluiting komt er één stroomdraad de meterkast binnen, bij een 3-fase aansluiting drie. Meer fasen betekent dat er meer vermogen tegelijk beschikbaar is, en dus dat een auto sneller kan laden.",
          },
          {
            type: "lijst",
            items: [
              "1-fase, 25A: doorgaans tot ongeveer 5,75 kW laadvermogen",
              "1-fase, 35A: doorgaans tot ongeveer 7,4 kW laadvermogen",
              "3-fase, 25A: doorgaans tot ongeveer 11 kW laadvermogen",
              "3-fase, 35A of meer: tot 22 kW, mits de auto dat ondersteunt",
            ],
          },
        ],
      },
      {
        kop: "De auto bepaalt mee",
        blokken: [
          {
            type: "alinea",
            tekst:
              "Het laadvermogen wordt begrensd door de zwakste schakel: de aansluiting, de laadpaal of de boordlader van de auto. Veel elektrische auto's laden thuis maximaal 11 kW, ook als de laadpaal 22 kW aankan. Een snellere laadpaal levert dan geen kortere laadtijd op.",
          },
        ],
      },
      {
        kop: "Wat heeft u nodig?",
        blokken: [
          {
            type: "alinea",
            tekst:
              "Voor de meeste huishoudens is 11 kW ruim voldoende: een accu die 's avonds wordt aangesloten, is de volgende ochtend vol. Rijdt u veel kilometers of laadt u meerdere auto's, dan is een 3-fase aansluiting met load balancing een verstandige keuze.",
          },
          {
            type: "kader",
            titel: "Weet u niet wat u heeft?",
            tekst:
              "In de meterkast is te zien of er één of drie fasen binnenkomen. Wij beoordelen dit bij de offerte, zodat het advies aansluit op uw werkelijke situatie.",
          },
        ],
      },
    ],
    faqs: [
      {
        vraag: "Kan ik van 1-fase naar 3-fase overstappen?",
        antwoord:
          "Dat kan door de netbeheerder uw aansluiting te laten verzwaren. Daar zijn kosten aan verbonden en er geldt een doorlooptijd. Vaak is het eerst zinvol om te kijken of load balancing op de bestaande aansluiting volstaat.",
      },
      {
        vraag: "Heeft een 22 kW laadpaal zin bij een 1-fase aansluiting?",
        antwoord:
          "Nee. Op een 1-fase aansluiting is het beschikbare vermogen begrensd, ongeacht wat de laadpaal aankan. Het maximale laadvermogen wordt bepaald door de zwakste schakel in de keten.",
      },
    ],
    bronnen: [BRON_MILIEUCENTRAAL_LADEN],
    gecontroleerdOp: GECONTROLEERD,
    gerelateerd: ["load-balancing", "vaste-kabel-of-stopcontact"],
  },
  {
    slug: "load-balancing",
    titel: "Load balancing en dynamic load balancing uitgelegd",
    categorie: "Techniek",
    samenvatting:
      "Waarom slaat de hoofdzekering eruit als de auto laadt terwijl de oven aanstaat — en hoe voorkomt load balancing dat?",
    leestijd: 4,
    secties: [
      {
        kop: "Het probleem: een gedeelde aansluiting",
        blokken: [
          {
            type: "alinea",
            tekst:
              "Uw aansluiting heeft een maximum. Een laadpaal is een van de grootste verbruikers in huis, dus als die op vol vermogen laadt terwijl ook de wasmachine, oven en warmtepomp draaien, kan de hoofdzekering aanslaan.",
          },
        ],
      },
      {
        kop: "Load balancing: verdelen over laadpunten",
        blokken: [
          {
            type: "alinea",
            tekst:
              "Bij (statische) load balancing wordt een vast beschikbaar vermogen verdeeld over meerdere laadpunten. Laden er twee auto's tegelijk, dan krijgt elk daarvan een deel. Zo blijft het totaal binnen de grens die voor de laadinstallatie is ingesteld.",
          },
        ],
      },
      {
        kop: "Dynamic load balancing: meebewegen met het huis",
        blokken: [
          {
            type: "alinea",
            tekst:
              "Dynamic load balancing gaat een stap verder: het systeem meet doorlopend het actuele verbruik van de hele woning of het pand, en past het laadvermogen daarop aan. Draait de oven, dan laadt de auto tijdelijk langzamer; is het verbruik laag, dan wordt er weer opgeschaald.",
          },
          {
            type: "kader",
            titel: "Wanneer heeft u het nodig?",
            tekst:
              "Statische load balancing volstaat vaak bij meerdere laadpunten op een ruime aansluiting. Dynamic load balancing is vooral waardevol bij een krappe aansluiting, bij zware verbruikers in huis, of wanneer u het maximale uit de bestaande capaciteit wilt halen zonder te verzwaren.",
          },
        ],
      },
    ],
    faqs: [
      {
        vraag: "Wat is het verschil tussen load balancing en dynamic load balancing?",
        antwoord:
          "Load balancing verdeelt een vast beschikbaar vermogen over meerdere laadpunten. Dynamic load balancing reageert daarnaast op het actuele verbruik van de woning of het pand en past het laadvermogen realtime aan.",
      },
      {
        vraag: "Laadt mijn auto langzamer door load balancing?",
        antwoord:
          "Alleen op momenten dat de capaciteit nodig is voor andere verbruikers of andere laadpunten. Zodra er ruimte is, schaalt het laadvermogen weer op. In de praktijk is de auto 's ochtends vrijwel altijd volgeladen.",
      },
    ],
    bronnen: [BRON_MILIEUCENTRAAL_LADEN],
    gecontroleerdOp: GECONTROLEERD,
    gerelateerd: ["1-fase-of-3-fase", "mid-meter", "laadpaal-vve"],
  },

  // ───────────────────────── Kiezen ─────────────────────────
  {
    slug: "vaste-kabel-of-stopcontact",
    titel: "Vaste kabel of laadstopcontact: welke kiest u?",
    categorie: "Kiezen",
    samenvatting:
      "Een laadpaal met vaste kabel is comfortabel, een type 2 stopcontact is flexibeler. De afweging in het kort.",
    leestijd: 3,
    secties: [
      {
        kop: "Vaste kabel",
        blokken: [
          {
            type: "alinea",
            tekst:
              "Bij een vaste kabel zit de laadkabel permanent aan de laadpaal. U pakt de stekker en steekt hem in de auto — geen kabel uit de kofferbak halen en opbergen.",
          },
          {
            type: "lijst",
            items: [
              "Comfortabel in dagelijks gebruik",
              "Kabellengte ligt vast; meet vooraf de afstand tot de laadpoort van de auto",
              "De kabel hangt permanent buiten en is gevoeliger voor slijtage",
            ],
          },
        ],
      },
      {
        kop: "Laadstopcontact (type 2)",
        blokken: [
          {
            type: "alinea",
            tekst:
              "Bij een laadstopcontact sluit u uw eigen kabel aan. Dat is flexibeler wanneer meerdere auto's of gebruikers van dezelfde laadpaal gebruikmaken, en de laadpaal blijft strak ogen zonder hangende kabel.",
          },
          {
            type: "lijst",
            items: [
              "Kabellengte en type kiest u zelf, en u kunt die later vervangen",
              "Hygiënischer en netter bij gedeeld gebruik",
              "U moet de kabel wel elke keer pakken en opbergen",
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        vraag: "Welke kabellengte heb ik nodig?",
        antwoord:
          "Meet de afstand van de geplande locatie van de laadpaal tot de laadpoort van uw auto, en houd rekening met hoe u parkeert. Wij adviseren hierover bij de offerte, zodat de kabel niet strak komt te staan.",
      },
    ],
    bronnen: [BRON_MILIEUCENTRAAL_LADEN],
    gecontroleerdOp: GECONTROLEERD,
    gerelateerd: ["1-fase-of-3-fase", "veilig-laden"],
  },
  {
    slug: "mid-meter",
    titel: "MID-meter: wanneer heeft u die nodig?",
    categorie: "Zakelijk & VvE",
    samenvatting:
      "Zodra u laadkosten doorberekent aan een ander — medewerker, huurder of bewoner — wordt de meting belangrijk. Dit doet een MID-gekeurde meter.",
    leestijd: 3,
    secties: [
      {
        kop: "Wat is een MID-meter?",
        blokken: [
          {
            type: "alinea",
            tekst:
              "MID staat voor de Europese Measuring Instruments Directive. Een MID-gekeurde meter voldoet aan Europese eisen voor meetnauwkeurigheid en is daardoor geschikt als basis voor afrekening tussen partijen.",
          },
        ],
      },
      {
        kop: "Wanneer is het relevant?",
        blokken: [
          {
            type: "lijst",
            items: [
              "U berekent laadkosten door aan medewerkers die thuis of op de zaak laden",
              "Een VvE verdeelt de energiekosten over bewoners die van gedeelde laadpunten gebruikmaken",
              "U verhuurt parkeerplaatsen met laadmogelijkheid en factureert het verbruik",
            ],
          },
          {
            type: "alinea",
            tekst:
              "Laadt u uitsluitend privé en rekent u met niemand af, dan is een MID-meter niet nodig. De meeste laadpalen registreren het verbruik dan alsnog in de app, wat voldoende is voor eigen inzicht.",
          },
        ],
      },
    ],
    faqs: [
      {
        vraag: "Kan ik zonder MID-meter kosten doorbelasten?",
        antwoord:
          "Voor eigen inzicht volstaat de meting in de app, maar wanneer u kosten in rekening brengt bij een ander is een MID-gekeurde meter van belang: die garandeert een meting die voldoet aan de Europese meeteisen.",
      },
    ],
    bronnen: [BRON_SVVE],
    gecontroleerdOp: GECONTROLEERD,
    gerelateerd: ["laadpaal-vve", "load-balancing"],
  },
  {
    slug: "veilig-laden",
    titel: "Veilig laden: waarom niet via een gewoon stopcontact",
    categorie: "Techniek",
    samenvatting:
      "Een elektrische auto laden via een huishoudelijk stopcontact of verlengsnoer is onveilig. Dit is waarom, en wat het alternatief is.",
    leestijd: 3,
    secties: [
      {
        kop: "Het risico van een gewoon stopcontact",
        blokken: [
          {
            type: "alinea",
            tekst:
              "Een elektrische auto trekt urenlang een hoge, constante stroom. Een huishoudelijk stopcontact en de bijbehorende bedrading zijn daar niet op berekend: de kabel kan te heet worden, met brandgevaar tot gevolg. Laden via een verlengsnoer of stekkerdoos vergroot dat risico.",
          },
        ],
      },
      {
        kop: "Wat een laadpaal anders doet",
        blokken: [
          {
            type: "alinea",
            tekst:
              "Een laadpaal (mode 3-laden) communiceert met de auto over hoeveel stroom veilig geleverd kan worden, en bewaakt de verbinding tijdens de hele laadsessie. De installatie is bovendien op de belasting berekend en wordt met eigen beveiliging aangesloten.",
          },
          {
            type: "kader",
            titel: "Installatie door een gecertificeerde monteur",
            tekst:
              "Een laadpaal hoort te worden aangesloten volgens NEN 1010, met een eigen groep en de juiste aardlekbeveiliging. Wij leveren na installatie een testrapport en opleverdocumentatie.",
          },
        ],
      },
    ],
    faqs: [
      {
        vraag: "Mag ik incidenteel via een stopcontact laden?",
        antwoord:
          "Het wordt afgeraden. Een gewoon stopcontact is niet gemaakt voor langdurige, hoge belasting: de kabel kan oververhit raken. Gebruik daarom een laadpaal en laad nooit via een verlengsnoer of stekkerdoos.",
      },
    ],
    bronnen: [
      BRON_MILIEUCENTRAAL_LADEN,
      {
        titel: "Opladers, batterijen en accu's",
        organisatie: "Brandweer Nederland",
        url: "https://www.brandweer.nl/onderwerpen/opladers-batterijen-en-accus/",
      },
    ],
    gecontroleerdOp: GECONTROLEERD,
    gerelateerd: ["1-fase-of-3-fase", "vaste-kabel-of-stopcontact"],
  },
];

export function getArtikel(slug: string): Artikel | undefined {
  return ARTIKELEN.find((a) => a.slug === slug);
}

export function getGerelateerdeArtikelen(artikel: Artikel, limiet = 3): Artikel[] {
  return artikel.gerelateerd
    .map((slug) => getArtikel(slug))
    .filter((a): a is Artikel => Boolean(a))
    .slice(0, limiet);
}

export const CATEGORIEEN = ["Techniek", "Kiezen", "Subsidie & regels", "Zakelijk & VvE"] as const;
