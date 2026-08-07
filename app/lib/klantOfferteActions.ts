import { supabase } from "./supabase";

/**
 * Laat de klant een offerte digitaal accepteren.
 *
 * De acceptatie loopt via een serverroute en niet meer via een aanroep op de
 * database vanuit de browser. Het toegangstoken gaat mee zodat de server zelf
 * vaststelt wie er accepteert; het offerte-id uit de browser is nooit
 * voldoende om iets vast te leggen.
 */
export type AcceptatieResultaat = {
  error: string | null;
  /** Tijdstip van acceptatie, ook als die al eerder had plaatsgevonden. */
  geaccepteerdOp?: string;
  /** Waar of de offerte al geaccepteerd was voordat dit verzoek binnenkwam. */
  alGeaccepteerd?: boolean;
};

export async function klantAccepteerOfferte(
  offerteId: string,
  akkoord: boolean
): Promise<AcceptatieResultaat> {
  if (!supabase) {
    return { error: "De acceptatiefunctie is niet beschikbaar." };
  }

  const { data: sessie } = await supabase.auth.getSession();
  const token = sessie.session?.access_token;
  if (!token) {
    return { error: "Uw sessie is verlopen. Log opnieuw in." };
  }

  try {
    const respons = await fetch("/api/portal/offerte-accepteren", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ offerteId, akkoord }),
    });

    const data = await respons.json().catch(() => ({}));

    if (respons.ok) {
      return { error: null, geaccepteerdOp: data.geaccepteerdOp };
    }

    // Een offerte die al geaccepteerd was is geen fout voor de klant: het
    // resultaat is precies wat hij wilde, alleen was het er al.
    if (data.alGeaccepteerd) {
      return { error: null, alGeaccepteerd: true, geaccepteerdOp: data.geaccepteerdOp };
    }

    return { error: data.error || "Het accepteren is niet gelukt. Probeer het opnieuw." };
  } catch (fout) {
    return { error: fout instanceof Error ? fout.message : "Het accepteren is niet gelukt." };
  }
}
