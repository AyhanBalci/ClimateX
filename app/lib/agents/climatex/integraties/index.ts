/**
 * ClimateX CRM Agent — externe koppelingen
 *
 * WAAROM DEZE OPZET
 * ─────────────────
 * De agent produceert concepten: een afspraak die ingepland kan worden, een
 * e-mail die verstuurd kan worden, een WhatsApp-bericht dat klaarstaat. Wie
 * die concepten uiteindelijk uitvoert — Google Calendar, Gmail, WhatsApp
 * Business — hoort de agent niet te weten.
 *
 * Daarom staat elke koppeling achter een interface met twee eigenschappen:
 *
 *   1. `isGeconfigureerd` — of de koppeling bruikbaar is. Zo niet, dan blijft
 *      het bij een concept dat een medewerker met de hand overneemt. De agent
 *      blijft dus werken zonder dat er ook maar één koppeling actief is.
 *   2. Methoden die een concept uitvoeren en een resultaat teruggeven, nooit
 *      een uitzondering gooien. Een agenda die er even uit ligt mag geen
 *      werkbon of offerte blokkeren.
 *
 * Elke koppeling heeft hieronder een eigen bestand met de precieze stappen om
 * hem te activeren. Zolang de sleutels ontbreken geeft `maak...Koppeling()`
 * een implementatie terug die netjes meldt dat er handmatig gehandeld moet
 * worden.
 */

export type KoppelingResultaat =
  | { gelukt: true; referentie: string; melding: string }
  | { gelukt: false; melding: string; handmatigeStap: string }

/** Basis die elke koppeling deelt. */
export interface Koppeling {
  naam: string
  isGeconfigureerd: boolean
  /** Wat er moet gebeuren om deze koppeling werkend te krijgen. */
  activatiestappen: string[]
}

export * from './agenda'
export * from './email'
export * from './whatsapp'
