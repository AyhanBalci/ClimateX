import { createHmac, timingSafeEqual } from "crypto";

/**
 * Server-side authenticatie voor de beheeromgeving.
 *
 * Dit bestand mag uitsluitend vanuit route handlers worden geïmporteerd. Het
 * wachtwoord stond eerder als letterlijke tekst in een client component en werd
 * daardoor meegebundeld naar de browser, waar iedereen het uit het JavaScript
 * kon lezen. Alles hieronder draait op de server; de browser krijgt alleen een
 * ondertekend sessiecookie te zien en nooit het wachtwoord zelf.
 */

export const SESSIE_COOKIE = "cx_dashboard";

/** Hoe lang een sessie geldig blijft. Daarna moet opnieuw worden ingelogd. */
const SESSIE_DUUR_SECONDEN = 60 * 60 * 8;

/**
 * Het dashboardwachtwoord komt uitsluitend uit DASHBOARD_PASSWORD.
 *
 * Er stond hier eerder een terugval op PORTAL_ADMIN_SECRET. Die is verwijderd
 * omdat hij onzichtbaar maakte wélk wachtwoord er gold: was DASHBOARD_PASSWORD
 * leeg of stond hij op de verkeerde omgeving, dan nam het portaalwachtwoord het
 * stilzwijgend over. De login gaf dan "Wachtwoord onjuist" op een wachtwoord
 * dat volgens de instellingen had moeten werken, zonder enig spoor naar de
 * oorzaak. Twee bronnen voor één slot is een fout op zich.
 *
 * PORTAL_ADMIN_SECRET wordt sindsdien nergens in de code meer uitgelezen. Ook
 * /api/portal/invite gebruikt inmiddels de dashboardsessie.
 *
 * Ontbreekt DASHBOARD_PASSWORD, dan geeft dit null en weigert de login iedereen.
 */
function geheim(): string | null {
  const wachtwoord = process.env.DASHBOARD_PASSWORD;
  // Alleen spaties is net zo goed niets, en is bij plakken zo gebeurd.
  return wachtwoord && wachtwoord.trim().length > 0 ? wachtwoord : null;
}

export function isDashboardAuthGeconfigureerd(): boolean {
  return geheim() !== null;
}

/**
 * Meldt bij het opstarten dat de beheeromgeving niet bruikbaar is.
 *
 * Bewust een luide waarschuwing en geen harde crash: dit bestand hangt aan de
 * route handlers van een site die verder gewoon publiek bereikbaar hoort te
 * zijn. Het proces laten vallen zou de hele website platleggen omdat één
 * beheerderswachtwoord ontbreekt, en dat is een zwaardere storing dan het
 * probleem dat het oplost. De login zelf weigert iedereen met een 503.
 */
if (!isDashboardAuthGeconfigureerd()) {
  console.error(
    "[dashboardAuth] DASHBOARD_PASSWORD ontbreekt of is leeg. De beheeromgeving " +
      "op /dashboard weigert daardoor elke login met status 503. Zet deze variabele " +
      "in de omgeving (in Vercel: Settings > Environment Variables, met het vinkje " +
      "Production aan) en deploy opnieuw. Let op onzichtbare spaties of regeleinden " +
      "bij het plakken. Er is sinds deze wijziging geen terugval meer op " +
      "PORTAL_ADMIN_SECRET; die variabele wordt nergens meer uitgelezen."
  );
}

/** Vergelijkt zonder dat de looptijd iets over het wachtwoord prijsgeeft. */
function veiligGelijk(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function wachtwoordKlopt(ingevoerd: string): boolean {
  const verwacht = geheim();
  if (!verwacht) return false;
  return veiligGelijk(ingevoerd, verwacht);
}

function onderteken(inhoud: string, sleutel: string): string {
  return createHmac("sha256", sleutel).update(inhoud).digest("hex");
}

/**
 * Het token bevat alleen een verloopmoment plus een handtekening daarover. Er
 * zit geen wachtwoord of andere geheime informatie in, en zonder het geheim is
 * er geen geldige handtekening te maken.
 */
export function maakSessieToken(): { token: string; maxAge: number } | null {
  const sleutel = geheim();
  if (!sleutel) return null;

  const verlooptOp = Date.now() + SESSIE_DUUR_SECONDEN * 1000;
  const inhoud = String(verlooptOp);
  return { token: `${inhoud}.${onderteken(inhoud, sleutel)}`, maxAge: SESSIE_DUUR_SECONDEN };
}

export function sessieIsGeldig(token: string | undefined): boolean {
  const sleutel = geheim();
  if (!sleutel || !token) return false;

  const [inhoud, handtekening] = token.split(".");
  if (!inhoud || !handtekening) return false;

  const verwacht = onderteken(inhoud, sleutel);
  if (!veiligGelijk(handtekening, verwacht)) return false;

  const verlooptOp = Number(inhoud);
  return Number.isFinite(verlooptOp) && verlooptOp > Date.now();
}

/**
 * Bewaakt route handlers die alleen een ingelogde beheerder mag aanroepen.
 *
 * Verschillende routes versturen e-mail naar klanten of naar de beheerder.
 * Zonder deze controle kan iedereen die het adres kent die verzending
 * aanzetten: een klant met herinneringen bestoken kost niets meer dan een
 * POST-verzoek, en de verstuurde bijlagen bevatten klantgegevens.
 *
 * Geeft null als het verzoek mag doorgaan, en anders het antwoord dat de route
 * moet teruggeven.
 */
export function weigerZonderDashboardSessie(request: Request): Response | null {
  if (!isDashboardAuthGeconfigureerd()) {
    return Response.json(
      {
        error:
          "De beheeromgeving is niet ingesteld: DASHBOARD_PASSWORD ontbreekt op de server. " +
          "Zet die variabele in de omgeving en deploy opnieuw.",
      },
      { status: 503 }
    );
  }

  const cookies = request.headers.get("cookie") || "";
  const token = cookies
    .split(";")
    .map((deel) => deel.trim())
    .find((deel) => deel.startsWith(`${SESSIE_COOKIE}=`))
    ?.slice(SESSIE_COOKIE.length + 1);

  if (!sessieIsGeldig(token ? decodeURIComponent(token) : undefined)) {
    return Response.json({ error: "Niet ingelogd in de beheeromgeving." }, { status: 401 });
  }

  return null;
}
