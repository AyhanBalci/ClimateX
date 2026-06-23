"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PortalAuthGuard, portalSignOut } from "../../lib/portalAuth";

const NAV_ITEMS = [
  { href: "/portal/dashboard", label: "Overzicht" },
  { href: "/portal/offertes", label: "Offertes" },
  { href: "/portal/facturen", label: "Facturen" },
  { href: "/portal/werkbonnen", label: "Werkbonnen" },
  { href: "/portal/tickets", label: "Meldingen" },
  { href: "/portal/uploads", label: "Foto's uploaden" },
];

export default function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await portalSignOut();
    router.replace("/portal/login");
  };

  return (
    <PortalAuthGuard>
      <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Mijn ClimateX</p>
              <h1 className="mt-2 text-xl font-semibold sm:text-2xl">Klantenportaal</h1>
            </div>
            <button
              onClick={handleLogout}
              className="self-start rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:bg-white/10 sm:self-auto"
            >
              Uitloggen
            </button>
          </div>

          <div className="mb-6 flex gap-2 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-full px-5 py-3 text-sm font-semibold transition ${
                  pathname === item.href
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {children}
        </div>
      </main>
    </PortalAuthGuard>
  );
}
