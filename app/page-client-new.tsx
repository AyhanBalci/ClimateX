"use client";

import { motion } from "framer-motion";
import { FormEvent, useMemo, useState } from "react";

const contactNumber = "06 1400 4488";
const whatsappLink = "https://wa.me/31614004488";

const productCategories = [
  {
    brand: "Daikin Premium",
    description: "Hoogwaardige binnenunits met stille werking en uitstekend rendement.",
    products: [
      {
        title: "Daikin Stylish FTXA25CW",
        power: "2,5 kW",
        energyLabel: "A+++",
        noise: "19 dB",
        wifi: true,
        price: "€1.899",
        description: "Premium compacte unit met elegant design en stille werking.",
      },
      {
        title: "Daikin Stylish FTXA35CW",
        power: "3,5 kW",
        energyLabel: "A+++",
        noise: "20 dB",
        wifi: true,
        price: "€2.099",
        description: "Efficiënte oplossing voor middelgrote ruimtes met topcomfort.",
      },
      {
        title: "Daikin Stylish FTXA50CW",
        power: "5,0 kW",
        energyLabel: "A++",
        noise: "22 dB",
        wifi: true,
        price: "€2.499",
        description: "Krachtige airconditioning voor grotere woonruimtes en kantoren.",
      },
    ],
  },
  {
    brand: "LG Design",
    description: "Strakke units met glansafwerking en slimme bedieningsopties.",
    products: [
      {
        title: "LG Artcool Mirror AC09BK",
        power: "2,5 kW",
        energyLabel: "A++",
        noise: "22 dB",
        wifi: true,
        price: "€1.699",
        description: "Moderne spiegelunit met discrete uitstraling en smart control.",
      },
      {
        title: "LG Artcool Mirror AC12BK",
        power: "3,5 kW",
        energyLabel: "A++",
        noise: "24 dB",
        wifi: true,
        price: "€1.899",
        description: "Stijlvol design met betrouwbare prestaties voor comfortabele kamers.",
      },
      {
        title: "LG Artcool Mirror AC18BK",
        power: "5,0 kW",
        energyLabel: "A+",
        noise: "26 dB",
        wifi: true,
        price: "€2.299",
        description: "Krachtige unit voor grotere ruimtes met premium afwerking.",
      },
    ],
  },
  {
    brand: "Gree Comfort",
    description: "Kwalitatieve units met scherp geprijsde prestaties en slimme functionaliteit.",
    products: [
      {
        title: "Gree Clivia 2,5 kW",
        power: "2,5 kW",
        energyLabel: "A+",
        noise: "23 dB",
        wifi: true,
        price: "€1.399",
        description: "Degelijke en betaalbare oplossing voor compacte woonruimtes.",
      },
      {
        title: "Gree Clivia 3,5 kW",
        power: "3,5 kW",
        energyLabel: "A+",
        noise: "25 dB",
        wifi: true,
        price: "€1.599",
        description: "Stabiele koelprestaties voor slimme woon- en werkruimtes.",
      },
      {
        title: "Gree Clivia 5,0 kW",
        power: "5,0 kW",
        energyLabel: "A",
        noise: "27 dB",
        wifi: true,
        price: "€1.999",
        description: "Robuuste capaciteit voor grotere woningen en kantoren.",
      },
    ],
  },
];

const roomOptions = [
  { value: "slaapkamer", label: "Slaapkamer" },
  { value: "woonkamer", label: "Woonkamer" },
];

const brandOptions = ["Daikin", "LG", "Gree"];
const housingOptions = ["Appartement", "Gezinswoning", "Bent u aannemer?"];

const seriesHighlights = [
  {
    title: "Compact & Stil",
    badge: "Premium",
    description: "Units met zeer lage geluidsniveaus voor woon- en slaapvertrekken.",
  },
  {
    title: "Slimme bediening",
    badge: "Connected",
    description: "Bedien uw klimaat met een app of afstandsbediening voor optimaal comfort.",
  },
  {
    title: "Installatie zonder zorgen",
    badge: "Service",
    description: "Professionele installatie en nazorg met duidelijke communicatie.",
  },
];

const reviews = [
  {
    author: "Sanne uit Amersfoort",
    role: "Particuliere opdrachtgever",
    quote: "Snelle service, helder advies en een stille airco. Perfect voor onze woonkamer.",
  },
  {
    author: "Remco, projectleider",
    role: "Aannemer",
    quote: "De installatie verliep soepel en de samenwerking met ClimateX was professioneel.",
  },
  {
    author: "Floor uit Utrecht",
    role: "Kantoorbeheerder",
    quote: "Prettig contact en een betrouwbare airco met weinig onderhoud.",
  },
];

const faqs = [
  {
    question: "Hoe snel kan ik een offerte ontvangen?",
    answer: "Na aanvraag ontvangt u meestal binnen 24 uur een voorstel met heldere prijsinformatie.",
  },
  {
    question: "Wat kost montage?",
    answer: "Montage is vanaf €450 inbegrepen bij de meeste standaard installaties.",
  },
  {
    question: "Krijg ik garantie?",
    answer: "Ja, de meeste airco-merken hebben standaard 2 jaar garantie op onderdelen en installatie.",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function recommendModel(answers: {
  roomSize: string;
  roomType: string;
  budgetFocus: string;
  designImportant: string;
}) {
  if (answers.budgetFocus === "premium") {
    return "Daikin Stylish FTXA35CW";
  }
  if (answers.roomType === "woonkamer" && answers.designImportant === "yes") {
    return "LG Artcool Mirror AC12BK";
  }
  if (answers.roomSize === "klein" && answers.budgetFocus === "budget") {
    return "Gree Clivia 2,5 kW";
  }
  return "Daikin Stylish FTXA25CW";
}

function estimatePrice(brand: string, power: string, install: boolean, extraMeters: number) {
  const base =
    brand === "Daikin"
      ? power === "2.5"
        ? 1899
        : power === "3.5"
        ? 2099
        : 2499
      : brand === "LG"
      ? power === "2.5"
        ? 1699
        : power === "3.5"
        ? 1899
        : 2299
      : power === "2.5"
      ? 1399
      : power === "3.5"
      ? 1599
      : 1999;
  const installCost = install ? 450 : 0;
  const meterCost = extraMeters * 35;
  return base + installCost + meterCost;
}

function estimateEnergySaving(currentCost: number, hoursPerDay: number) {
  const annualUsage = currentCost * hoursPerDay * 365;
  return annualUsage * 0.4;
}

export default function HomeClient() {
  const [formState, setFormState] = useState({
    name: "",
    phone: "",
    email: "",
    postcode: "",
    woningType: "Gezinswoning",
    ruimte: "Slaapkamer",
    merk: "Daikin",
    bericht: "",
  });
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [choiceState, setChoiceState] = useState({
    roomSize: "klein",
    roomType: "woonkamer",
    budgetFocus: "budget",
    designImportant: "no",
  });
  const [recommended, setRecommended] = useState("");
  const [calculator, setCalculator] = useState({
    brand: "Daikin",
    power: "2.5",
    install: true,
    extraMeters: 0,
  });
  const [priceEstimate, setPriceEstimate] = useState(estimatePrice("Daikin", "2.5", true, 0));
  const [energyState, setEnergyState] = useState({ currentCost: 0, hours: 0 });
  const [energySaving, setEnergySaving] = useState(0);

  const recommendedProduct = useMemo(
    () => recommendModel(choiceState),
    [choiceState]
  );

  const handleFormChange = (field: string, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleChoiceSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecommended(recommendedProduct);
  };

  const handleCalculatorSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPriceEstimate(
      estimatePrice(
        calculator.brand,
        calculator.power,
        calculator.install,
        calculator.extraMeters
      )
    );
  };

  const handleEnergySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEnergySaving(
      estimateEnergySaving(energyState.currentCost, energyState.hours)
    );
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
          ruimte: "Slaapkamer",
          merk: "Daikin",
          bericht: "",
        });
      } else {
        setFormMessage(result.error || "Er is iets misgegaan. Probeer het later opnieuw.");
      }
    } catch (error) {
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
                <a href="#keuzehulp" className="transition hover:text-white">Keuzehulp</a>
                <a href="#calculator" className="transition hover:text-white">Calculator</a>
                <a href="#contact" className="transition hover:text-white">Contact</a>
              </div>
            </nav>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-xl">
              Premium airco-installatie met montage en service in Nederland
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              ClimateX. Premium airco’s inclusief montage.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
              Daikin, LG en Gree airco’s met strakke installatie en snelle service. Vraag direct uw offerte aan via telefoon of WhatsApp.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-slate-100"
              >
                Direct offerte aanvragen
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
              <h2 className="mt-3 text-3xl font-semibold text-white">Vakkundige montage en service</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Installatie met een vaste prijs inclusief montage, koudemiddelcontrole en oplevering.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Professionele montage",
                "Koude- en leidingcontrole",
                "Veilige elektrische aansluiting",
                "Advies over rendement",
              ].map((item) => (
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

      <section className="px-6 py-16 sm:px-10 lg:px-16">
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
              Premium airco modellen met scherpe vanaf-prijzen.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              Bekijk onze Daikin, LG en Gree modellen. Alle prijzen zijn inclusief montage en een compacte offerte-aanvraag.
            </p>
          </motion.div>
          <div className="grid gap-6 lg:grid-cols-3">
            {productCategories.map((category, index) => (
              <motion.article
                key={category.brand}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-xl shadow-black/30"
              >
                <div className="mb-6 rounded-[1.75rem] border border-white/10 bg-slate-900 p-8">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{category.brand}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{category.description}</p>
                </div>
                <div className="space-y-4">
                  <div className="rounded-[1.75rem] border border-white/10 bg-[#090909] p-5">
                    <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{category.products[0].title}</h3>
                        <p className="mt-2 text-sm text-slate-400">{category.products[0].description}</p>
                      </div>
                      <div className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-200">{category.products[0].power}</div>
                    </div>
                    <div className="mb-4 grid gap-3 sm:grid-cols-3">
                      <span className="rounded-3xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.25em] text-slate-300">{category.products[0].energyLabel}</span>
                      <span className="rounded-3xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.25em] text-slate-300">{category.products[0].noise}</span>
                      <span className="rounded-3xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.25em] text-slate-300">Wifi</span>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-2xl font-semibold text-white">{category.products[0].price}</p>
                      <a href="#contact" className="inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15">
                        Offerte aanvragen
                      </a>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="mt-10 text-center text-sm text-slate-400">
            Voor exacte prijzen en installatiekosten maken wij graag een vrijblijvende offerte op maat.
          </div>
        </div>
      </section>

      <section id="keuzehulp" className="bg-[#070707] px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Airco keuzehulp</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Vind het beste model voor uw situatie.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Vul uw voorkeuren in en wij tonen direct een aanbevolen model met een realistische prijsindicatie.
              </p>
            </div>
            <form onSubmit={handleChoiceSubmit} className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-black/20">
              <div className="grid gap-5">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Hoe groot is de ruimte?</span>
                  <select
                    value={choiceState.roomSize}
                    onChange={(event) => setChoiceState((current) => ({ ...current, roomSize: event.target.value }))}
                    className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  >
                    <option value="klein">Klein</option>
                    <option value="middel">Middel</option>
                    <option value="groot">Groot</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Slaapkamer of woonkamer?</span>
                  <select
                    value={choiceState.roomType}
                    onChange={(event) => setChoiceState((current) => ({ ...current, roomType: event.target.value }))}
                    className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  >
                    {roomOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Budget of premium?</span>
                  <select
                    value={choiceState.budgetFocus}
                    onChange={(event) => setChoiceState((current) => ({ ...current, budgetFocus: event.target.value }))}
                    className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  >
                    <option value="budget">Budget</option>
                    <option value="premium">Premium</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Design belangrijk?</span>
                  <select
                    value={choiceState.designImportant}
                    onChange={(event) => setChoiceState((current) => ({ ...current, designImportant: event.target.value }))}
                    className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  >
                    <option value="no">Nee</option>
                    <option value="yes">Ja</option>
                  </select>
                </label>
              </div>
              <button type="submit" className="mt-8 w-full rounded-full bg-cyan-400 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                Aanbevolen model tonen
              </button>
            </form>
          </div>
          {recommended ? (
            <div className="mt-10 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-black/20">
              <h3 className="text-xl font-semibold text-white">Aanbevolen model</h3>
              <p className="mt-4 text-sm text-slate-300">Wij raden u het volgende model aan op basis van uw keuzes:</p>
              <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-[#090909] p-6">
                <p className="text-lg font-semibold text-white">{recommended}</p>
                <p className="mt-2 text-sm text-slate-400">Deze keuze past bij uw ruimte en gebruiksvoorkeur.</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section id="calculator" className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Prijscalculator</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Bereken direct een prijsindicatie.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Kies merk, vermogen, montage en extra leidingmeters. De calculator toont een realistische indicatieprijs.
              </p>
            </div>
            <form onSubmit={handleCalculatorSubmit} className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-black/20">
              <div className="grid gap-5">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Merk</span>
                  <select
                    value={calculator.brand}
                    onChange={(event) => setCalculator((current) => ({ ...current, brand: event.target.value }))}
                    className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  >
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Vermogen</span>
                  <select
                    value={calculator.power}
                    onChange={(event) => setCalculator((current) => ({ ...current, power: event.target.value }))}
                    className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  >
                    <option value="2.5">2,5 kW</option>
                    <option value="3.5">3,5 kW</option>
                    <option value="5.0">5,0 kW</option>
                  </select>
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={calculator.install}
                    onChange={(event) => setCalculator((current) => ({ ...current, install: event.target.checked }))}
                    className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-300 focus:ring-cyan-300"
                  />
                  Montage inbegrepen
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Extra leidingmeters</span>
                  <input
                    type="number"
                    min={0}
                    value={calculator.extraMeters}
                    onChange={(event) => setCalculator((current) => ({ ...current, extraMeters: Number(event.target.value) }))}
                    className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  />
                </label>
              </div>
              <button type="submit" className="mt-8 w-full rounded-full bg-cyan-400 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                Bereken indicatieprijs
              </button>
              <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-[#090909] p-5 text-white">
                Indicatieprijs: <span className="font-semibold">{formatCurrency(priceEstimate)}</span>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-[#070707] px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Energiebesparing</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Bereken uw mogelijke jaarlijkse besparing.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Vul uw huidige energiekosten en gebruiksuren in. Wij tonen een realistische besparing bij een moderne airco.
              </p>
            </div>
            <form onSubmit={handleEnergySubmit} className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-black/20">
              <div className="grid gap-5">
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Huidige kosten per uur</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={energyState.currentCost}
                    onChange={(event) => setEnergyState((current) => ({ ...current, currentCost: Number(event.target.value) }))}
                    className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Aantal gebruiksuren per dag</span>
                  <input
                    type="number"
                    min={0}
                    value={energyState.hours}
                    onChange={(event) => setEnergyState((current) => ({ ...current, hours: Number(event.target.value) }))}
                    className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  />
                </label>
              </div>
              <button type="submit" className="mt-8 w-full rounded-full bg-cyan-400 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                Bereken besparing
              </button>
              <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-[#090909] p-5 text-white">
                Geschatte jaarlijkse besparing: <span className="font-semibold">{formatCurrency(energySaving)}</span>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section id="contact" className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300/80">Contact</p>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Vraag nu uw offerte aan.
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
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Gewenste ruimte</span>
                  <input
                    type="text"
                    value={formState.ruimte}
                    placeholder="Bijv. woonkamer, slaapkamer"
                    onChange={(event) => handleFormChange("ruimte", event.target.value)}
                    className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Gewenst merk</span>
                  <select
                    value={formState.merk}
                    onChange={(event) => handleFormChange("merk", event.target.value)}
                    className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  >
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  <span>Bericht</span>
                  <textarea
                    rows={4}
                    value={formState.bericht}
                    placeholder="Korte omschrijving van uw wens"
                    onChange={(event) => handleFormChange("bericht", event.target.value)}
                    className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  />
                </label>
              </div>
              <button type="submit" className="mt-8 w-full rounded-full bg-cyan-400 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                Offerte aanvragen
              </button>
              {formMessage ? (
                <p className="mt-4 text-sm text-slate-300">{formMessage}</p>
              ) : null}
            </form>
          </div>
        </div>
      </section>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-4 text-sm font-semibold text-slate-950 shadow-2xl shadow-black/30 transition hover:bg-emerald-300"
      >
        WhatsApp
      </a>
    </main>
  );
}
