"use client";

import { FormEvent, useEffect, useState } from "react";
import { Product } from "../../lib/types";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

const emptyForm = {
  merk: "",
  model: "",
  beschrijving: "",
  koelvermogen: "",
  verwarmvermogen: "",
  energieklasse: "",
  prijs: "",
  afbeelding_url: "",
  handleiding_url: "",
};

type FormState = typeof emptyForm;

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<"closed" | "new" | string>("closed");
  const [formState, setFormState] = useState<FormState>(emptyForm);

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
      beschrijving: product.beschrijving || "",
      koelvermogen: product.koelvermogen || "",
      verwarmvermogen: product.verwarmvermogen || "",
      energieklasse: product.energieklasse || "",
      prijs: product.prijs != null ? String(product.prijs) : "",
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

    if (!formState.merk.trim() || !formState.model.trim()) {
      setError("Vul minimaal merk en model in.");
      return;
    }

    const payload = {
      merk: formState.merk.trim(),
      model: formState.model.trim(),
      beschrijving: formState.beschrijving.trim(),
      koelvermogen: formState.koelvermogen.trim(),
      verwarmvermogen: formState.verwarmvermogen.trim(),
      energieklasse: formState.energieklasse.trim(),
      prijs: Number(formState.prijs) || 0,
      afbeelding_url: formState.afbeelding_url.trim() || null,
      handleiding_url: formState.handleiding_url.trim() || null,
    };

    if (formMode === "new") {
      const { data, error: insertError } = await supabase.from("producten").insert(payload).select().single();
      if (insertError) {
        setError(insertError.message);
        return;
      }
      setProducts((current) => [...current, data as Product].sort((a, b) => a.merk.localeCompare(b.merk) || a.model.localeCompare(b.model)));
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
  };

  const handleDelete = async (product: Product) => {
    if (!supabase) return;
    const confirmed = window.confirm(`Weet u zeker dat u "${product.merk} ${product.model}" wilt verwijderen?`);
    if (!confirmed) return;

    const { error: deleteError } = await supabase.from("producten").delete().eq("id", product.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setProducts((current) => current.filter((item) => item.id !== product.id));
  };

  const handleToggleActief = async (product: Product) => {
    if (!supabase) return;
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
    setProducts((current) => current.map((item) => (item.id === product.id ? (data as Product) : item)));
  };

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

      {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}
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
              placeholder="Indicatieprijs incl. installatie (€)"
              value={formState.prijs}
              onChange={(event) => setFormState((current) => ({ ...current, prijs: event.target.value }))}
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
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="submit" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
              Opslaan
            </button>
            <button type="button" onClick={closeForm} className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-white transition hover:bg-white/10">
              Annuleren
            </button>
          </div>
        </form>
      ) : null}

      {!loading && products.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">Er zijn nog geen producten. Voeg een product toe.</p>
      ) : null}

      {!loading && products.length > 0 ? (
        <>
          <div className="mt-6 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-4 py-3">Merk</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Geschikt voor</th>
                  <th className="px-4 py-3">Prijs</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Acties</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-white/5 text-slate-300">
                    <td className="px-4 py-3">{product.merk}</td>
                    <td className="px-4 py-3">{product.model}</td>
                    <td className="px-4 py-3">{product.energieklasse}</td>
                    <td className="px-4 py-3">{formatCurrency(product.prijs)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${product.actief ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
                        {product.actief ? "Actief" : "Inactief"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => openEditForm(product)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10">
                          Wijzigen
                        </button>
                        <button onClick={() => handleToggleActief(product)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10">
                          {product.actief ? "Deactiveren" : "Activeren"}
                        </button>
                        <button onClick={() => handleDelete(product)} className="rounded-full bg-rose-500/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20">
                          Verwijderen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3 sm:hidden">
            {products.map((product) => (
              <div key={product.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{product.merk} {product.model}</p>
                    <p className="mt-1 text-sm text-slate-400">{product.energieklasse} · {formatCurrency(product.prijs)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${product.actief ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
                    {product.actief ? "Actief" : "Inactief"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => openEditForm(product)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10">
                    Wijzigen
                  </button>
                  <button onClick={() => handleToggleActief(product)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10">
                    {product.actief ? "Deactiveren" : "Activeren"}
                  </button>
                  <button onClick={() => handleDelete(product)} className="rounded-full bg-rose-500/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20">
                    Verwijderen
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
