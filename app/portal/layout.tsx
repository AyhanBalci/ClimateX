"use client";

import { ReactNode } from "react";
import { PortalSessieProvider } from "../lib/portalAuth";

/**
 * Stelt de portaalsessie beschikbaar aan álle pagina's onder /portal.
 *
 * De provider hoort hier en niet dieper in de boom: een pagina die
 * usePortalSession() aanroept moet de echte sessie krijgen, niet de
 * standaardwaarde. De inlogpagina valt hier ook onder, maar krijgt bewust
 * geen PortalAuthGuard; die zou een bezoeker eindeloos naar zichzelf
 * doorsturen.
 */
export default function PortalLayout({ children }: { children: ReactNode }) {
  return <PortalSessieProvider>{children}</PortalSessieProvider>;
}
