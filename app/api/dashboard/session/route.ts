import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSIE_COOKIE,
  isDashboardAuthGeconfigureerd,
  maakSessieToken,
  sessieIsGeldig,
  wachtwoordKlopt,
} from "../../../lib/dashboardAuth";

/**
 * Sessiebeheer voor de beheeromgeving. De controle gebeurt hier op de server,
 * zodat het wachtwoord nooit in de browser terechtkomt. Antwoorden bevatten
 * uitsluitend een ja/nee, nooit het wachtwoord of een deel daarvan.
 */

function cookieOpties(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/** Controleert of er al een geldige sessie is, zodat verversen niet uitlogt. */
export async function GET() {
  const token = (await cookies()).get(SESSIE_COOKIE)?.value;
  return NextResponse.json({ ingelogd: sessieIsGeldig(token) });
}

/** Inloggen. */
export async function POST(request: Request) {
  if (!isDashboardAuthGeconfigureerd()) {
    console.error(
      "[dashboard/session] DASHBOARD_PASSWORD ontbreekt of is leeg; inloggen is " +
        "daarom niet mogelijk. Zet de variabele in de omgeving (in Vercel met het " +
        "vinkje Production aan) en deploy opnieuw."
    );
    // De melding noemt de variabele met naam. Dit scherm is alleen voor
    // beheerders, en zonder die naam bleef onduidelijk wat er moest gebeuren.
    return NextResponse.json(
      {
        error:
          "De beheeromgeving is niet ingesteld: DASHBOARD_PASSWORD ontbreekt op de server. " +
          "Zet die variabele in de omgeving en deploy opnieuw.",
      },
      { status: 503 }
    );
  }

  let wachtwoord = "";
  try {
    const body = await request.json();
    wachtwoord = typeof body?.wachtwoord === "string" ? body.wachtwoord : "";
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  if (!wachtwoord) {
    return NextResponse.json({ error: "Vul het wachtwoord in." }, { status: 400 });
  }

  if (!wachtwoordKlopt(wachtwoord)) {
    console.warn("[dashboard/session] Mislukte inlogpoging op de beheeromgeving.");
    return NextResponse.json({ error: "Wachtwoord onjuist." }, { status: 401 });
  }

  const sessie = maakSessieToken();
  if (!sessie) {
    return NextResponse.json({ error: "Inloggen is tijdelijk niet mogelijk." }, { status: 503 });
  }

  const response = NextResponse.json({ ingelogd: true });
  response.cookies.set(SESSIE_COOKIE, sessie.token, cookieOpties(sessie.maxAge));
  return response;
}

/** Uitloggen. */
export async function DELETE() {
  const response = NextResponse.json({ ingelogd: false });
  response.cookies.set(SESSIE_COOKIE, "", cookieOpties(0));
  return response;
}
