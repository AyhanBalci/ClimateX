"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Product } from "../../lib/types";
import { PRODUCT_CATEGORIE_OPTIONS } from "../../lib/constants";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { formatBedrag, formatBedragRond } from "../../lib/formatters";
import { STANDAARD_BTW_PERCENTAGE, berekenMarge, berekenPrijsOpbouw } from "../../lib/productPrijzen";


const emptyForm = {
  merk: "",
  model: "",
  categorie: PRODUCT_CATEGORIE_OPTIONS[0],
  beschrijving: "",
  koelvermogen: "",
  verwarmvermogen: "",
  energieklasse: "",
  prijs: "",
  inkoopprijs: "",
  adviesprijs: "",
  installatiekosten: "",
  btw_percentage: String(STANDAARD_BTW_PERCENTAGE),
  afbeelding_url: "",
  handleiding_url: "",
};

type FormState = typeof emptyForm;

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<"closed" | "new" | string>("closed");
  const [formState, setFormState] = useState<FormState>(emptyForm);

  const [zoekterm, setZoekterm] = useState("");
  const [categorieFilter, setCategorieFilter] = useState("Alle");
  const [merkFilter, setMerkFilter] = useState("Alle");
  const [statusFilter, setStatusFilter] = useState("Alle");

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured || !supabase) {
        setError("Supabase is niet geconfigureerd.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("producten")
        .select("*")
        .order("merk", { ascending: true })
        .order("model", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setProducts((data as Product[]) || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const openNewForm = () => {
    setFormState(emptyForm);
    setFormMode("new");
  };

  const openEditForm = (product: Product) => {
    setFormState({
      merk: product.merk || "",
      model: product.model || "",
      categorie: product.categorie || PRODUCT_CATEGORIE_OPTIONS[0],
      beschrijving: product.beschrijving || "",
      koelvermogen: product.koelvermogen || "",
      verwarmvermogen: product.verwarmvermogen || "",
      energieklasse: product.energieklasse || "",
      prijs: product.prijs != null ? String(product.prijs) : "",
      inkoopprijs: product.inkoopprijs != null ? String(product.inkoopprijs) : "",
      adviesprijs: product.adviesprijs != null ? String(product.adviesprijs) : "",
      installatiekosten: product.installatiekosten != null ? String(product.installatiekosten) : "",
      btw_percentage:
        product.btw_percentage != null ? String(product.btw_percentage) : String(STANDAARD_BTW_PERCENTAGE),
      afbeelding_url: product.afbeelding_url || "",
      handleiding_url: product.handleiding_url || "",
    });
    setFormMode(product.id);
  };

  const closeForm = () => {
    setFormMode("closed");
    setFormState(emptyForm);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;

    // Tweede klik tijdens het opslaan negeren, anders ontstaat een dubbel product.
    if (bezig) return;

    if (!formState.merk.trim() || !formState.model.trim()) {
      setError("Vul minimaal merk en model in.");
      return;
    }

    setBezig(true);
    try {
      const payload = {
        merk: formState.merk.trim(),
        model: formState.model.trim(),
        categorie: formState.categorie,
        beschrijving: formState.beschrijving.trim(),
        koelvermogen: formState.koelvermogen.trim(),
        verwarmvermogen: formState.verwarmvermogen.trim(),
        energieklasse: formState.energieklasse.trim(),
        prijs: Number(formState.prijs) || 0,
        // Lege prijsvelden blijven leeg in plaats van 0: een onbekende
        // inkoopprijs is iets anders dan een inkoopprijs van nul euro.
        inkoopprijs: formState.inkoopprijs.trim() ? Number(formState.inkoopprijs) : null,
        adviesprijs: formState.adviesprijs.trim() ? Number(formState.adviesprijs) : null,
        installatiekosten: Number(formState.installatiekosten) || 0,
        btw_percentage: formState.btw_percentage.trim()
          ? Number(formState.btw_percentage)
          : STANDAARD_BTW_PERCENTAGE,
        afbeelding_url: formState.afbeelding_url.trim() || null,
        handleiding_url: formState.handleiding_url.trim() || null,
      };

      if (formMode === "new") {
        const { data, error: insertError } = await supabase.from("producten").insert(payload).select().single();
        if (insertError) {
          setError(insertError.message);
          return;
        }
        setProducts((current) =>
          [...current, data as Product].sort((a, b) => a.merk.localeCompare(b.merk) || a.model.localeCompare(b.model)),
        );
      } else {
        const { data, error: updateError } = await supabase
          .from("producten")
          .update(payload)
          .eq("id", formMode)
          .select()
          .single();
        if (updateError) {
          setError(updateError.message);
          return;
        }
        setProducts((current) => current.map((product) => (product.id === formMode ? (data as Product) : product)));
      }

      setError(null);
      closeForm();
    } finally {
      setBezig(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!supabase || actionId) return;
    const confirmed = window.confirm(`Weet u zeker dat u "${product.merk} ${product.model}" wilt verwijderen?`);
    if (!confirmed) return;

    setActionId(product.id);
    try {
      const { error: deleteError } = await supabase.from("producten").delete().eq("id", product.id);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
      setError(null);
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } finally {
      setActionId(null);
    }
  };

  const handleToggleActief = async (product: Product) => {
    if (!supabase || actionId) return;

    setActionId(product.id);
    try {
      const { data, error: updateError } = await supabase
        .from("producten")
        .update({ actief: !product.actief })
        .eq("id", product.id)
        .select()
        .single();

      if (updateError) {
        setError(updateError.message);
        return;
      }
      setError(null);
      setProducts((current) => current.map((item) => (item.id === product.id ? (data as Product) : item)));
    } finally {
      setActionId(null);
    }
  };

  const merken = useMemo(
    () => Array.from(new Set(products.map((product) => product.merk).filter(Boolean))).sort(),
    [products]
  );

  const gefilterd = useMemo(() => {
    const term = zoekterm.trim().toLowerCase();
    return products.filter((product) => {
      if (categorieFilter !== "Alle" && (product.categorie || "Laadpaal") !== categorieFilter) return false;
      if (merkFilter !== "Alle" && product.merk !== merkFilter) return false;
      if (statusFilter === "Actief" && !product.actief) return false;
      if (statusFilter === "Inactief" && product.actief) return false;

      if (!term) return true;
      return [product.merk, product.model, product.beschrijving, product.categorie, product.energieklasse]
        .filter(Boolean)
        .some((veld) => String(veld).toLowerCase().includes(term));
    });
  }, [products, zoekterm, categorieFilter, merkFilter, statusFilter]);

  const filterKlasse =
    "w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300";

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">Producten</h2>
        <button
          onClick={openNewForm}
          className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          + Nieuw product
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-rose-400">
          {error}
        </p>
      ) : null}
      {loading ? <p className="mt-6 text-sm text-slate-400">Bezig met laden...</p> : null}

      {formMode !== "closed" ? (
        <form onSubmit={handleSubmit} className="mt-6 rounded-3xl border border-white/10 bg-[#090909] p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-white">{formMode === "new" ? "Nieuw product" : "Product wijzigen"}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Merk"
              value={formState.merk}
              onChange={(event) => setFormState((current) => ({ ...current, merk: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="text"
              placeholder="Model"
              value={formState.model}
              onChange={(event) => setFormState((current) => ({ ...current, model: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <select
              aria-label="Categorie"
              value={formState.categorie}
              onChange={(event) => setFormState((current) => ({ ...current, categorie: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
            >
              {PRODUCT_CATEGORIE_OPTIONS.map((optie) => (
                <option key={optie} value={optie}>
                  {optie}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Laadvermogen (bijv. 11 kW)"
              value={formState.koelvermogen}
              onChange={(event) => setFormState((current) => ({ ...current, koelvermogen: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="text"
              placeholder="Slimme functies (bijv. App-besturing, load balancing)"
              value={formState.verwarmvermogen}
              onChange={(event) => setFormState((current) => ({ ...current, verwarmvermogen: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="text"
              placeholder="Geschikt voor (bijv. Thuis & Zakelijk)"
              value={formState.energieklasse}
              onChange={(event) => setFormState((current) => ({ ...current, energieklasse: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="Verkoopprijs excl. BTW (€)"
              value={formState.prijs}
              onChange={(event) => setFormState((current) => ({ ...current, prijs: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="Installatiekosten excl. BTW (€)"
              value={formState.installatiekosten}
              onChange={(event) => setFormState((current) => ({ ...current, installatiekosten: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="Inkoopprijs (intern, €)"
              value={formState.inkoopprijs}
              onChange={(event) => setFormState((current) => ({ ...current, inkoopprijs: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="Adviesprijs fabrikant (€)"
              value={formState.adviesprijs}
              onChange={(event) => setFormState((current) => ({ ...current, adviesprijs: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              placeholder="BTW-percentage"
              value={formState.btw_percentage}
              onChange={(event) => setFormState((current) => ({ ...current, btw_percentage: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="text"
              placeholder="Afbeeldings-URL"
              value={formState.afbeelding_url}
              onChange={(event) => setFormState((current) => ({ ...current, afbeelding_url: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />
            <input
              type="text"
              placeholder="Handleiding-URL (optioneel, zichtbaar in klantenportaal)"
              value={formState.handleiding_url}
              onChange={(event) => setFormState((current) => ({ ...current, handleiding_url: event.target.value }))}
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
            />
            <textarea
              rows={3}
              placeholder="Beschrijving"
              value={formState.beschrijving}
              onChange={(event) => setFormState((current) => ({ ...current, beschrijving: event.target.value }))}
              className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:col-span-2"
            />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Prijsopbouw</p>
              {(() => {
                const opbouw = berekenPrijsOpbouw({
                  prijs: Number(formState.prijs) || 0,
                  installatiekosten: Number(formState.installatiekosten) || 0,
                  btw_percentage: formState.btw_percentage.trim()
                    ? Number(formState.btw_percentage)
                    : STANDAARD_BTW_PERCENTAGE,
                });
                const marge = berekenMarge({
                  prijs: Number(formState.prijs) || 0,
                  inkoopprijs: formState.inkoopprijs.trim() ? Number(formState.inkoopprijs) : null,
                });
                return (
                  <dl className="mt-3 space-y-1 text-sm">
                    {[
                      { label: "Product", waarde: formatBedrag(opbouw.product) },
                      { label: "Installatie", waarde: formatBedrag(opbouw.installatie) },
                      { label: "Subtotaal excl. BTW", waarde: formatBedrag(opbouw.subtotaal) },
                      { label: `BTW ${opbouw.btwPercentage}%`, waarde: formatBedrag(opbouw.btw) },
                      { label: "Totaal incl. BTW", waarde: formatBedrag(opbouw.totaal) },
                      { label: "Brutomarge", waarde: marge === null ? "—" : `${marge}%` },
                    ].map((regel) => (
                      <div key={regel.label} className="flex justify-between gap-3">
                        <dt className="text-slate-400">{regel.label}</dt>
                        <dd className="text-slate-200">{regel.waarde}</dd>
                      </div>
                    ))}
                  </dl>
                );
              })()}
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Afbeelding</p>
              {formState.afbeelding_url.trim() ? (
                <div className="relative mt-3 h-40 w-full overflow-hidden rounded-2xl bg-black/40">
                  <Image
                    src={formState.afbeelding_url.trim()}
                    alt={`Voorbeeld van ${formState.merk} ${formState.model}`.trim()}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 320px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Vul een afbeeldings-URL in voor een voorbeeld.</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={bezig}
              className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {bezig ? "Bezig met opslaan…" : "Opslaan"}
            </button>
            <button type="button" onClick={closeForm} className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-white transition hover:bg-white/10">
              Annuleren
            </button>
          </div>
        </form>
      ) : null}

      {!loading && products.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="sr-only" htmlFor="product-zoek">
            Zoek een product
          </label>
          <input
            id="product-zoek"
            type="search"
            placeholder="Zoek op merk, model of beschrijving"
            value={zoekterm}
            onChange={(event) => setZoekterm(event.target.value)}
            className={filterKlasse}
          />
          <select
            aria-label="Filter op categorie"
            value={categorieFilter}
            onChange={(event) => setCategorieFilter(event.target.value)}
            className={filterKlasse}
          >
            <option value="Alle">Alle categorieën</option>
            {PRODUCT_CATEGORIE_OPTIONS.map((optie) => (
              <option key={optie} value={optie}>
                {optie}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter op merk"
            value={merkFilter}
            onChange={(event) => setMerkFilter(event.target.value)}
            className={filterKlasse}
          >
            <option value="Alle">Alle merken</option>
            {merken.map((merk) => (
              <option key={merk} value={merk}>
                {merk}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter op beschikbaarheid"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={filterKlasse}
          >
            <option value="Alle">Actief en inactief</option>
            <option value="Actief">Alleen actief</option>
            <option value="Inactief">Alleen inactief</option>
          </select>
        </div>
      ) : null}

      {!loading && products.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">Er zijn nog geen producten. Voeg een product toe.</p>
      ) : null}

      {!loading && products.length > 0 && gefilterd.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">Geen producten gevonden voor deze zoekopdracht of filters.</p>
      ) : null}

      {!loading && gefilterd.length > 0 ? (
        <>
          <div className="mt-6 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-4 py-3">Merk</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Categorie</th>
                  <th className="px-4 py-3">Verkoop excl.</th>
                  <th className="px-4 py-3">Installatie</th>
                  <th className="px-4 py-3">Totaal incl. BTW</th>
                  <th className="px-4 py-3">Marge</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Acties</th>
                </tr>
              </thead>
              <tbody>
                {gefilterd.map((product) => (
                  <tr key={product.id} className="border-b border-white/5 text-slate-300">
                    <td className="px-4 py-3">{product.merk}</td>
                    <td className="px-4 py-3">{product.model}</td>
                    <td className="px-4 py-3">{product.categorie || "Laadpaal"}</td>
                    <td className="px-4 py-3">{formatBedragRond(product.prijs)}</td>
                    <td className="px-4 py-3">{formatBedragRond(product.installatiekosten || 0)}</td>
                    <td className="px-4 py-3 text-white">{formatBedragRond(berekenPrijsOpbouw(product).totaal)}</td>
                    <td className="px-4 py-3">
                      {berekenMarge(product) === null ? "—" : `${berekenMarge(product)}%`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${product.actief ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
                        {product.actief ? "Actief" : "Inactief"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => openEditForm(product)}
                          disabled={actionId === product.id}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Wijzigen
                        </button>
                        <button
                          onClick={() => handleToggleActief(product)}
                          disabled={actionId === product.id}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionId === product.id ? "Bezig…" : product.actief ? "Deactiveren" : "Activeren"}
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={actionId === product.id}
                          className="rounded-full bg-rose-500/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionId === product.id ? "Bezig…" : "Verwijderen"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3 sm:hidden">
            {gefilterd.map((product) => (
              <div key={product.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{product.merk} {product.model}</p>
                    <p className="mt-1 text-sm text-slate-400">{product.categorie || "Laadpaal"}</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {formatBedragRond(berekenPrijsOpbouw(product).totaal)} incl. BTW
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatBedragRond(product.prijs)} product + {formatBedragRond(product.installatiekosten || 0)}{" "}
                      installatie, excl. BTW
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${product.actief ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
                    {product.actief ? "Actief" : "Inactief"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => openEditForm(product)}
                    disabled={actionId === product.id}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Wijzigen
                  </button>
                  <button
                    onClick={() => handleToggleActief(product)}
                    disabled={actionId === product.id}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionId === product.id ? "Bezig…" : product.actief ? "Deactiveren" : "Activeren"}
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    disabled={actionId === product.id}
                    className="rounded-full bg-rose-500/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionId === product.id ? "Bezig…" : "Verwijderen"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
