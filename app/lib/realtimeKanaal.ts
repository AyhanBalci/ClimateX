/**
 * Unieke namen voor Supabase realtime-kanalen.
 *
 * WAAROM DIT BESTAAT
 * ──────────────────
 * `supabase.channel(naam)` geeft bij een naam die al bestaat het BESTAANDE
 * kanaal terug. Abonneerden twee componenten zich op dezelfde vaste naam, dan
 * riep de tweede `.on(...)` aan op een kanaal waarop de eerste al
 * `.subscribe()` had gedaan. Supabase gooit daar terecht een fout op:
 *
 *   cannot add `postgres_changes` callbacks for realtime:… after `subscribe()`
 *
 * Die fout ontstond in een useEffect en sloopte daarmee de hele pagina. Op het
 * dashboard gebeurde dat bij elke login, omdat DashboardKpis en
 * DashboardOverzicht tegelijk mounten en allebei hetzelfde kanaal wilden.
 *
 * Elk abonnement krijgt daarom zijn eigen naam. Dat kost niets: Supabase
 * bundelt kanalen over één websocketverbinding.
 */

/**
 * Naam met een willekeurig achtervoegsel.
 *
 * `crypto.randomUUID` bestaat alleen in een beveiligde context. De dev-server
 * draait met `--hostname 0.0.0.0`, dus wie hem via een LAN-adres over http
 * opent (een monteur die op zijn telefoon test) heeft die functie niet. Zonder
 * terugval zou dat exact dezelfde paginacrash geven als het probleem dat we
 * hier oplossen, alleen met een andere foutmelding.
 */
export function uniekeKanaalnaam(basis: string): string {
  const willekeurig =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  return `${basis}-${willekeurig}`;
}
