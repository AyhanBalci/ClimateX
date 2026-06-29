"use client";

import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import ProductImagePlaceholder from "./components/ProductImagePlaceholder";
import WhatsAppButton from "./components/WhatsAppButton";
import { Product } from "./lib/types";

function formatProductPrice(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value) + " incl. installatie";
}

const contactNumber = "06 1400 4488";
const whatsappLink = "https://wa.me/31614004488";

const housingOptions = ["Appartement", "Gezinswoning", "Vrijstaande woning", "Bent u aannemer of VvE?"];
const aansluitingOptions = ["1-fase", "3-fase", "Weet ik niet"];

const diensten = [
  { titel: "Laadpaal thuis", omschrijving: "Veilig en snel laden op uw eigen oprit of in de garage, volledig op maat geïnstalleerd." },
  { titel: "Zakelijke laadpalen", omschrijving: "Laadoplossingen voor bedrijfsterreinen, wagenparken en personeelsparkeerplaatsen." },
  { titel: "VvE laadoplossingen", omschrijving: "Eerlijke verdeling van laadcapaciteit voor meerdere bewoners in één pand of parkeergarage." },
  { titel: "Onderhoud", omschrijving: "Periodieke controle en onderhoud zodat uw laadpaal altijd veilig en betrouwbaar blijft werken." },
  { titel: "Storingen", omschrijving: "Snelle storingsdienst, ook melden via het klantenportaal, met servicebezoek op korte termijn." },
  { titel: "Slim laden", omschrijving: "Laad automatisch op de goedkoopste momenten of op zelf opgewekte zonne-energie." },
  { titel: "Load balancing", omschrijving: "Verdeel beschikbare stroom automatisch over meerdere laadpunten zonder de hoofdaansluiting te overbelasten." },
  { titel: "Dynamic load balancing", omschrijving: "Slimme, realtime sturing van laadvermogen op basis van het actuele verbruik in uw pand." },
  { titel: "Meterkast uitbreiden", omschrijving: "Wij beoordelen en breiden uw meterkast uit indien nodig voor een veilige aansluiting." },
  { titel: "Advies", omschrijving: "Onafhankelijk advies over de beste laadoplossing voor uw woning of organisatie." },
];

const binnenkort = [
  { titel: "Zonnepanelen", omschrijving: "Wek uw eigen stroom op en laad uw auto met groene energie." },
  { titel: "Thuisbatterijen", omschrijving: "Sla zelf opgewekte energie op en gebruik deze wanneer u die nodig heeft." },
  { titel: "Warmtepompen", omschrijving: "Duurzaam verwarmen, los van gas, met subsidiemogelijkheden." },
];

const voordelen = [
  "Erkende, gecertificeerde installateurs",
  "Vaste prijs, geen verrassingen achteraf",
  "Advies over load balancing en subsidies",
  "Garantie op installatie en materialen",
];

const stappen = [
  { titel: "Offerte & advies", omschrijving: "U vraagt een vrijblijvende offerte aan, wij adviseren over de beste laadoplossing." },
  { titel: "Inspectie meterkast", omschrijving: "Onze installateur beoordeelt uw meterkast en de gewenste locatie van de laadpaal." },
  { titel: "Installatie", omschrijving: "Veilige, vakkundige installatie van uw laadpaal, meestal binnen één dag." },
  { titel: "Oplevering & garantie", omschrijving: "U ontvangt de testresultaten, garantie en een werkende laadpaal met uitleg." },
];

const reviews = [
  { naam: "Familie de Vries", quote: "Binnen een week een laadpaal én duidelijk advies over load balancing. Top geregeld." },
  { naam: "Bedrijfspand Noord BV", quote: "ClimateX heeft 6 laadpunten op ons terrein geïnstalleerd met slimme verdeling. Werkt feilloos." },
  { naam: "VvE De Hoek", quote: "Eerlijke verdeling van laadcapaciteit voor alle bewoners, prettig en duidelijk traject." },
];

const faqs = [
  { vraag: "Wat kost een laadpaal installeren?", antwoord: "De kosten hangen af van uw meterkast, de gewenste laadpaal en de afstand tot de meterkast. Na een gratis offerte weet u exact waar u aan toe bent." },
  { vraag: "Hoe lang duurt de installatie?", antwoord: "Een standaard installatie bij een woning duurt meestal één dagdeel. Zakelijke en VvE-projecten plannen wij in overleg in." },
  { vraag: "Wat is load balancing?", antwoord: "Load balancing verdeelt automatisch het beschikbare vermogen over meerdere laadpunten, zodat u nooit de hoofdaansluiting overbelast." },
  { vraag: "Krijg ik garantie?", antwoord: "Ja, op zowel de installatie als de geleverde laadpaal ontvangt u standaard garantie." },
];

export default function HomeClient({ products }: { products: Product[] }) {
  const [formState, setFormState] = useState({
    name: "",
    phone: "",
    email: "",
    postcode: "",
    woningType: "Gezinswoning",
    aantalLaadpunten: "1",
    elektrischVoertuig: "Ja",
    automerk: "",
    automodel: "",
    aansluiting: "1-fase",
    parkeerplaats: "",
    loadBalancing: false,
    dynamicLoadBalancing: false,
    bericht: "",
  });
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage("Verzenden...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          source: "website",
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setFormMessage(result.message || "Bedankt. Wij nemen binnen 24 uur contact met u op.");
        setFormState({
          name: "",
          phone: "",
          email: "",
          postcode: "",
          woningType: "Gezinswoning",
          aantalLaadpunten: "1",
          elektrischVoertuig: "Ja",
          automerk: "",
          automodel: "",
          aansluiting: "1-fase",
          parkeerplaats: "",
          loadBalancing: false,
          dynamicLoadBalancing: false,
          bericht: "",
        });
      } else {
        setFormMessage(result.error || "Er is iets misgegaan. Probeer het later opnieuw.");
      }
    } catch {
      setFormMessage("Er is iets misgegaan. Probeer het later opnieuw.");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section id="home" className="relative overflow-hidden bg-[#060606] px-6 py-12 sm:px-10 lg:px-16">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_52%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black via-transparent" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl space-y-8"
          >
            <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 text-sm text-slate-300">
              <span className="font-semibold text-white">ClimateX</span>
              <div className="flex flex-wrap gap-3">
                <a href="#home" className="transition hover:text-white">Home</a>
                <a href="/products" className="transition hover:text-white">Producten</a>
                <a href="#diensten" className="transition hover:text-white">Diensten</a>
                <a href="#binnenkort" className="transition hover:text-white">Binnenkort</a>
                <a href="#faq" className="transition hover:text-white">Veelgesteld</a>
                <a href="#contact" className="transition hover:text-white">Contact</a>
              </div>
            </nav>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-xl">
              Slimme energieoplossingen voor woningen en bedrijven
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              ClimateX. Premium laadpalen, vakkundig geïnstalleerd.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
              Laadpalen van Alfen, Zaptec, Easee, Wallbox, ABB, EVBox en Smappee voor thuis, zakelijk en VvE. Vraag direct een gratis offerte aan via telefoon of WhatsApp.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-slate-100"
              >
                Gratis offerte aanvragen
              </a>
              <a
                href="tel:+31614004488"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm text-white transition hover:border-white/30 hover:bg-white/10"
              >
                Bel direct
              </a>
              <a
                href={whatsappLink}
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm text-white transition hover:border-white/30 hover:bg-white/10"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:max-w-md"
          >
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_40%)]" />
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Installatie & service</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Vakkundige installatie en service</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Installatie met een vaste prijs inclusief meterkastcontrole, testresultaten en oplevering.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {voordelen.map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="diensten" className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-8 max-w-2xl"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Diensten</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Alles voor slim en veilig laden.
            </h2>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {diensten.map((dienst) => (
              <div key={dienst.titel} className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
                <h3 className="text-lg font-semibold text-white">{dienst.titel}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{dienst.omschrijving}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#070707] px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-8 max-w-2xl"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Producten</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Premium laadpalen met scherpe vanaf-prijzen.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              Bekijk onze laadpalen van Alfen, Zaptec, Easee, Wallbox, ABB, EVBox en Smappee. Alle prijzen zijn inclusief installatie en een vrijblijvende offerte-aanvraag.
            </p>
          </motion.div>
          {products.length === 0 ? (
            <p className="text-sm text-slate-400">Er zijn momenteel geen producten beschikbaar.</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {products.map((product) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-xl shadow-black/30"
                >
                  <div className="space-y-4">
                    <div className="rounded-[1.75rem] border border-white/10 bg-[#090909] p-5">
                      {product.afbeelding_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.afbeelding_url}
                          alt={`${product.merk} ${product.model}`}
                          className="mb-4 h-40 w-full rounded-[1.5rem] object-cover"
                        />
                      ) : (
                        <ProductImagePlaceholder label={`${product.merk} ${product.model}`} />
                      )}
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{product.merk}</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{product.model}</h3>
                      <p className="mt-2 text-sm text-slate-400">{product.beschrijving}</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <span className="rounded-3xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">Laadvermogen {product.koelvermogen}</span>
                        <span className="rounded-3xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">{product.verwarmvermogen}</span>
                        <span className="rounded-3xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300 sm:col-span-2">Geschikt voor: {product.energieklasse}</span>
                      </div>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-lg font-semibold text-white">{formatProductPrice(product.prijs)}</p>
                        <a href="#contact" className="inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15">
                          Offerte aanvragen
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
          <div className="mt-10 text-center text-sm text-slate-400">
            Voor exacte prijzen en installatiekosten maken wij graag een vrijblijvende offerte op maat.
          </div>
        </div>
      </section>

      <section id="binnenkort" className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-8 max-w-2xl"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-300/80">Binnenkort beschikbaar</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Op weg naar volledig duurzame energie.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              Naast laadpalen breidt ClimateX binnenkort uit met de volgende energieoplossingen.
            </p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-3">
            {binnenkort.map((item) => (
              <div key={item.titel} className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Binnenkort
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.titel}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.omschrijving}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#070707] px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Installatieproces</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Van offerte tot werkende laadpaal.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stappen.map((stap, index) => (
              <div key={stap.titel} className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
                <span className="text-sm font-semibold text-cyan-300">Stap {index + 1}</span>
                <h3 className="mt-2 text-lg font-semibold text-white">{stap.titel}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{stap.omschrijving}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Reviews</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Wat klanten van ClimateX zeggen.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.naam} className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
                <p className="text-sm leading-6 text-slate-300">&ldquo;{review.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold text-white">{review.naam}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#070707] px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Veelgestelde vragen</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Alles wat u wilt weten over laadpalen.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.vraag} className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
                <h3 className="text-base font-semibold text-white">{faq.vraag}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{faq.antwoord}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300/80">Contact</p>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Vraag nu uw gratis offerte aan.
              </h2>
              <p className="max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Vul het formulier in of bel direct. Wij nemen binnen 24 uur contact met u op voor een persoonlijk adviesgesprek.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Telefoon</p>
                  <a href="tel:+31614004488" className="mt-3 block text-xl font-semibold text-white">{contactNumber}</a>
                </div>
                <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">E-mail</p>
                  <p className="mt-3 text-xl font-semibold text-white">contact@climatex.nl</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-black/20">
              <div className="grid gap-5">
                {[
                  { name: "name", label: "Naam", type: "text", placeholder: "Jouw naam" },
                  { name: "phone", label: "Telefoonnummer", type: "tel", placeholder: "06 1400 4488" },
                  { name: "email", label: "E-mailadres", type: "email", placeholder: "naam@voorbeeld.nl" },
                  { name: "postcode", label: "Postcode", type: "text", placeholder: "1234 AB" },
                ].map((field) => (
                  <label key={field.name} className="space-y-2 text-sm text-slate-300">
                    <span>{field.label}</span>
                    <input
                      type={field.type}
                      value={formState[field.name as keyof typeof formState] as string}
                      placeholder={field.placeholder}
                      onChange={(event) => handleFormChange(field.name, event.target.value)}
                      className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                    />
                  </label>
                ))}
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Type woning</span>
                  <select
                    value={formState.woningType}
                    onChange={(event) => handleFormChange("woningType", event.target.value)}
                    className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  >
                    {housingOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Aantal laadpunten</span>
                    <input
                      type="number"
                      min={1}
                      value={formState.aantalLaadpunten}
                      onChange={(event) => handleFormChange("aantalLaadpunten", event.target.value)}
                      className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Heeft u al een elektrische auto?</span>
                    <select
                      value={formState.elektrischVoertuig}
                      onChange={(event) => handleFormChange("elektrischVoertuig", event.target.value)}
                      className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                    >
                      <option value="Ja">Ja</option>
                      <option value="Nee, binnenkort">Nee, binnenkort</option>
                    </select>
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Automerk (optioneel)</span>
                    <input
                      type="text"
                      value={formState.automerk}
                      placeholder="Bijv. Tesla, Volkswagen"
                      onChange={(event) => handleFormChange("automerk", event.target.value)}
                      className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Automodel (optioneel)</span>
                    <input
                      type="text"
                      value={formState.automodel}
                      placeholder="Bijv. Model 3, ID.4"
                      onChange={(event) => handleFormChange("automodel", event.target.value)}
                      className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                    />
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Aansluiting</span>
                    <select
                      value={formState.aansluiting}
                      onChange={(event) => handleFormChange("aansluiting", event.target.value)}
                      className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                    >
                      {aansluitingOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Parkeerplaats</span>
                    <input
                      type="text"
                      value={formState.parkeerplaats}
                      placeholder="Bijv. eigen oprit, garage, openbare weg"
                      onChange={(event) => handleFormChange("parkeerplaats", event.target.value)}
                      className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                    />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={formState.loadBalancing}
                      onChange={(event) => handleFormChange("loadBalancing", event.target.checked)}
                      className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-300 focus:ring-cyan-300"
                    />
                    Interesse in load balancing
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={formState.dynamicLoadBalancing}
                      onChange={(event) => handleFormChange("dynamicLoadBalancing", event.target.checked)}
                      className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-300 focus:ring-cyan-300"
                    />
                    Interesse in dynamic load balancing
                  </label>
                </div>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Bericht</span>
                  <textarea
                    rows={4}
                    value={formState.bericht}
                    placeholder="Korte omschrijving van uw wens, bijv. afstand tot de meterkast of kabellengte"
                    onChange={(event) => handleFormChange("bericht", event.target.value)}
                    className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  />
                </label>
              </div>
              <button type="submit" className="mt-8 w-full rounded-full bg-cyan-400 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                Gratis offerte aanvragen
              </button>
              {formMessage ? (
                <p className="mt-4 text-sm text-slate-300">{formMessage}</p>
              ) : null}
            </form>
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </main>
  );
}
