import QuoteForm from "../components/QuoteForm";
import WhatsAppButton from "../components/WhatsAppButton";
import SiteNav from "../components/marketing/SiteNav";
import StickyMobileCta from "../components/marketing/StickyMobileCta";
import ProductCard from "../components/marketing/ProductCard";
import { supabase } from "../lib/supabase";
import { Product } from "../lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Laadpalen vergelijken | Alfen, Zaptec, Easee, Wallbox, ABB",
  description:
    "Bekijk en vergelijk premium laadpalen voor thuis en zakelijk gebruik. Inclusief installatie, load balancing en garantie. Vraag direct een gratis offerte aan.",
};

export default async function ProductsPage() {
  let products: Product[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("producten")
      .select("*")
      .eq("actief", true)
      .order("merk", { ascending: true })
      .order("model", { ascending: true });
    products = (data as Product[]) || [];
  }

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-zinc-950 text-white">
        <section className="relative overflow-hidden bg-[#060606] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_55%)] blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Productpagina</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Laadpalen van Alfen, Zaptec, Easee, Wallbox, ABB, EVBox en Smappee.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-400">
              Alle prijzen zijn inclusief installatie. Kies de laadpaal die past bij uw situatie en vraag direct een gratis offerte aan.
            </p>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            {products.length === 0 ? (
              <p className="text-center text-sm text-slate-400">Er zijn momenteel geen producten beschikbaar.</p>
            ) : (
              <div className="grid gap-6">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>

          <section id="offerte" className="mt-20">
            <div className="mx-auto max-w-2xl">
              <p className="text-center text-sm uppercase tracking-[0.24em] text-emerald-300/80">Offerte</p>
              <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight text-white">
                Vraag een gratis offerte aan voor uw laadpaal.
              </h2>
              <p className="mt-3 text-center text-sm leading-7 text-slate-400">
                Vul het formulier in en wij nemen binnen 24 uur contact met u op.
              </p>
              <div className="mt-8">
                <QuoteForm />
              </div>
            </div>
          </section>
        </section>

        <WhatsAppButton />
        <StickyMobileCta />
        <div className="h-16 sm:hidden" aria-hidden="true" />
      </main>
    </>
  );
}
