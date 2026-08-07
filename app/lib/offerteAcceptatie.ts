/**
 * Digitale acceptatie van offertes.
 *
 * De akkoordtekst staat hier als constante en wordt op twee plekken gebruikt:
 * het portaal toont hem naast het vinkje, en de server legt hem letterlijk vast
 * bij de acceptatie. Verandert de tekst later, dan blijft bij eerdere
 * acceptaties staan waarmee die klanten akkoord gingen.
 */

export const AKKOORDTEKST =
  "Ik ga akkoord met deze offerte en de bijbehorende voorwaarden.";

export type OfferteAcceptatie = {
  id: string;
  created_at: string;
  offerte_id: string;
  geaccepteerd_op: string;
  klant_user_id: string;
  akkoordtekst: string;
  offerte_momentopname: Record<string, unknown>;
};
