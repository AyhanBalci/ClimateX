import Link from "next/link";
import QuoteForm from "../components/QuoteForm";
import WhatsAppButton from "../components/WhatsAppButton";
import ProductImagePlaceholder from "../components/ProductImagePlaceholder";
import { supabase } from "../lib/supabase";
import { Product } from "../lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Laadpalen vergelijken | Alfen, Zaptec, Easee, Wallbox, ABB",
  description:
    "Bekijk en vergelijk premium laadpalen voor thuis en zakelijk gebruik. Inclusief installatie, load balancing en garantie. Vraag direct een gratis offerte aan.",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value) + " incl. installatie";
}

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
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 text-sm text-slate-300">
            <Link href="/" className="transition hover:text-white">
              Terug naar home
            </Link>
            <span className="font-semibold text-white">Producten</span>
          </nav>
          <div className="mb-12 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Productpagina</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Laadpalen van Alfen, Zaptec, Easee, Wallbox, ABB, EVBox en Smappee.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              Alle prijzen zijn inclusief installatie. Kies de laadpaal die past bij uw situatie en vraag direct een gratis offerte aan.
            </p>
          </div>

          {products.length === 0 ? (
            <p className="text-sm text-slate-400">Er zijn momenteel geen producten beschikbaar.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {products.map((product) => (
                <article key={product.id} className="rounded-[2rem] border border-white/10 bg-[#090909] p-6">
                  {product.afbeelding_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.afbeelding_url}
                      alt={`${product.merk} ${product.model}`}
                      loading="lazy"
                      className="mb-4 h-40 w-full rounded-[1.5rem] object-cover"
                    />
                  ) : (
                    <ProductImagePlaceholder label={`${product.merk} ${product.model}`} />
                  )}
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{product.merk}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{product.model}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{product.beschrijving}</p>
                  <div className="mt-4 grid gap-2">
                    <span className="rounded-3xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">Laadvermogen {product.koelvermogen}</span>
                    <span className="rounded-3xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">{product.verwarmvermogen}</span>
                    <span className="rounded-3xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">Geschikt voor: {product.energieklasse}</span>
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <span className="text-lg font-semibold text-white">{formatPrice(product.prijs)}</span>
                    <Link href="#offerte" className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                      Offerte
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          <section id="offerte" className="mt-16">
            <div className="mx-auto max-w-2xl">
              <p className="text-center text-sm uppercase tracking-[0.24em] text-emerald-300/80">Offerte</p>
              <h2 className="mt-3 text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
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
        </div>
      </section>
      <WhatsAppButton />
    </main>
  );
}
