import Link from "next/link";
import { BatteryCharging, Home, Zap } from "lucide-react";
import SiteNav from "./components/marketing/SiteNav";
import Footer from "./components/marketing/Footer";

export const metadata = {
  title: "Pagina niet gevonden",
};

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-32 text-center text-white">
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle,_rgba(56,189,248,0.12),_transparent_60%)] blur-3xl" />
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
            <BatteryCharging className="h-7 w-7 text-cyan-300" />
          </span>
          <p className="mt-8 text-sm uppercase tracking-[0.24em] text-cyan-300/80">Foutcode 404</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Deze pagina is niet gevonden.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-400">
            De pagina die u zoekt bestaat niet (meer) of is verplaatst. Bekijk onze laadpalen of ga terug naar de homepage.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/producten"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-slate-100"
            >
              <Zap className="h-4 w-4" /> Bekijk laadpalen
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm text-white transition hover:bg-white/10"
            >
              <Home className="h-4 w-4" /> Naar de homepage
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
