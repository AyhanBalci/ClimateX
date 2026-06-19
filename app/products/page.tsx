import Link from "next/link";
import { featuredProducts } from "../data/products";
import ProductImagePlaceholder from "../components/ProductImagePlaceholder";
import QuoteForm from "../components/QuoteForm";
import WhatsAppButton from "../components/WhatsAppButton";

const productCategories = [
  {
    brand: "Daikin Premium",
    description: "Hoogwaardige units met stille werking en uitstekende energieprestaties.",
    products: [
      { title: "Daikin Stylish FTXA25CW", power: "2,5 kW", price: "€1.899", energyLabel: "A+++", noise: "19 dB" },
      { title: "Daikin Stylish FTXA35CW", power: "3,5 kW", price: "€2.099", energyLabel: "A+++", noise: "20 dB" },
      { title: "Daikin Stylish FTXA50CW", power: "5,0 kW", price: "€2.499", energyLabel: "A++", noise: "22 dB" },
    ],
  },
  {
    brand: "LG Design",
    description: "Strakke designunits met slimme bediening en een premium afwerking.",
    products: [
      { title: "LG Artcool Mirror AC09BK", power: "2,5 kW", price: "€1.699", energyLabel: "A++", noise: "22 dB" },
      { title: "LG Artcool Mirror AC12BK", power: "3,5 kW", price: "€1.899", energyLabel: "A++", noise: "24 dB" },
      { title: "LG Artcool Mirror AC18BK", power: "5,0 kW", price: "€2.299", energyLabel: "A+", noise: "26 dB" },
    ],
  },
  {
    brand: "Gree Comfort",
    description: "Betaalbare comfortunits met slimme WiFi-bediening en betrouwbaar rendement.",
    products: [
      { title: "Gree Clivia 2,5 kW", power: "2,5 kW", price: "€1.399", energyLabel: "A+", noise: "23 dB" },
      { title: "Gree Clivia 3,5 kW", power: "3,5 kW", price: "€1.599", energyLabel: "A+", noise: "25 dB" },
      { title: "Gree Clivia 5,0 kW", power: "5,0 kW", price: "€1.999", energyLabel: "A", noise: "27 dB" },
    ],
  },
];

export default function ProductsPage() {
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
              Daikin, LG en Gree modellen met prijzen en specificaties.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              Alle prijzen zijn inclusief montage. Kies het model dat past bij uw ruimte en vraag direct een offerte aan.
            </p>
          </div>

          <section className="mb-12 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Aanbevolen modellen</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Onze drie meest gekozen airco&apos;s.
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {featuredProducts.map((product) => (
                <article key={product.slug} className="rounded-[2rem] border border-white/10 bg-[#090909] p-6">
                  <ProductImagePlaceholder label={product.title} />
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{product.brand}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{product.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{product.shortDescription}</p>
                  <div className="mt-4 grid gap-3">
                    <span className="rounded-3xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">{product.coolingHeating}</span>
                    <span className="rounded-3xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">{product.energyLabel}</span>
                  </div>
                  <div className="mt-6 flex flex-col gap-3">
                    <span className="text-lg font-semibold text-white">{product.priceLabel}</span>
                    <Link href="#offerte" className="rounded-full bg-cyan-400 px-4 py-2 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                      Offerte aanvragen
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="grid gap-8">
            {productCategories.map((category) => (
              <section key={category.brand} className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-black/20">
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">{category.brand}</p>
                    <p className="mt-3 text-xl font-semibold text-white">{category.description}</p>
                  </div>
                  <Link href="#contact" className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15">
                    Vraag offerte aan
                  </Link>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  {category.products.map((product) => (
                    <article key={product.title} className="rounded-[2rem] border border-white/10 bg-[#090909] p-6">
                      <div className="mb-4 h-40 rounded-[1.5rem] bg-slate-900/90" />
                      <h2 className="text-xl font-semibold text-white">{product.title}</h2>
                      <p className="mt-3 text-sm text-slate-400">{product.power} · {product.energyLabel} · {product.noise}</p>
                      <p className="mt-4 text-sm leading-6 text-slate-300">Professionele binnenunit met wifi-bediening en stille werking.</p>
                      <div className="mt-6 flex items-center justify-between gap-4">
                        <span className="text-2xl font-semibold text-white">{product.price}</span>
                        <Link href="/" className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                          Offerte
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section id="offerte" className="mt-16">
            <div className="mx-auto max-w-2xl">
              <p className="text-center text-sm uppercase tracking-[0.24em] text-emerald-300/80">Offerte</p>
              <h2 className="mt-3 text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Vraag een offerte aan voor uw airco.
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
