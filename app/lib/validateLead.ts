export type LeadInput = {
  naam: string;
  telefoon: string;
  email: string;
  /** Plaats of postcode, afhankelijk van welk formulier de lead aanlevert. */
  plaats: string;
  type_woning: string;
};

export type LeadValidatieOpties = {
  /** Hoe het locatieveld heet in het formulier, zodat de melding klopt. */
  locatieLabel?: "plaats" | "postcode";
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLead(input: LeadInput, opties: LeadValidatieOpties = {}): string | null {
  const locatie = opties.locatieLabel ?? "plaats";

  if (!input.naam?.trim()) return "Vul uw naam in.";
  if (!input.telefoon?.trim()) return "Vul uw telefoonnummer in.";
  if (!input.email?.trim()) return "Vul uw e-mailadres in.";
  if (!input.plaats?.trim()) return `Vul uw ${locatie} in.`;
  if (!input.type_woning?.trim()) return "Kies een type woning.";

  if (!emailRegex.test(input.email.trim())) {
    return "Vul een geldig e-mailadres in.";
  }

  const digitCount = (input.telefoon.match(/\d/g) || []).length;
  if (digitCount < 8) {
    return "Telefoonnummer moet minimaal 8 cijfers bevatten.";
  }

  return null;
}
