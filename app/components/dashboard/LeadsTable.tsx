"use client";

import { useMemo, useState } from "react";
import { Lead } from "../../lib/types";
import { STATUS_OPTIONS, HOUSING_OPTIONS } from "../../lib/constants";
import { updateLeadStatus } from "../../lib/leadActions";

function formatDate(value: string) {
  return new Date(value).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" });
}

type Props = {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onLeadUpdated: (leadId: string, newStatus: string) => void;
};

export default function LeadsTable({ leads, onSelectLead, onLeadUpdated }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [woningFilter, setWoningFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        !term ||
        lead.naam?.toLowerCase().includes(term) ||
        lead.telefoon?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.plaats?.toLowerCase().includes(term);

      const matchesStatus = !statusFilter || lead.status === statusFilter;
      const matchesWoning = !woningFilter || lead.type_woning === woningFilter;

      const leadDate = lead.created_at?.slice(0, 10);
      const matchesFrom = !dateFrom || (leadDate && leadDate >= dateFrom);
      const matchesTo = !dateTo || (leadDate && leadDate <= dateTo);

      return matchesSearch && matchesStatus && matchesWoning && matchesFrom && matchesTo;
    });
  }, [leads, search, statusFilter, woningFilter, dateFrom, dateTo]);

  const handleStatusUpdate = async (leadId: string) => {
    const newStatus = selectedStatus[leadId];
    if (!newStatus) return;

    const { error: updateError } = await updateLeadStatus(leadId, newStatus);
    if (updateError) {
      setError(updateError);
      return;
    }
    setError(null);
    onLeadUpdated(leadId, newStatus);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Zoek op naam, telefoon, email of plaats"
          className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20 sm:max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:w-auto"
        >
          <option value="">Alle statussen</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={woningFilter}
          onChange={(event) => setWoningFilter(event.target.value)}
          className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 sm:w-auto"
        >
          <option value="">Alle woningtypes</option>
          {HOUSING_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
          <span className="text-sm text-slate-500">t/m</span>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}

      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">
        {filteredLeads.length} van {leads.length} leads
      </p>

      {filteredLeads.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">Geen leads gevonden voor deze zoekopdracht of filters.</p>
      ) : (
        <>
          {/* Tabelweergave vanaf tablet/desktop */}
          <div className="mt-4 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-4 py-3">Datum</th>
                  <th className="px-4 py-3">Naam</th>
                  <th className="px-4 py-3">Telefoon</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Plaats</th>
                  <th className="px-4 py-3">Type woning</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Acties</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 text-slate-300">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">{formatDate(lead.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="inline-flex items-center gap-1 text-left font-medium text-cyan-300 underline-offset-4 transition hover:text-cyan-200 hover:underline"
                      >
                        {lead.naam}
                        <span aria-hidden="true">→</span>
                      </button>
                    </td>
                    <td className="px-4 py-3">{lead.telefoon}</td>
                    <td className="px-4 py-3">{lead.email}</td>
                    <td className="px-4 py-3">{lead.plaats}</td>
                    <td className="px-4 py-3">{lead.type_woning}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={selectedStatus[lead.id] ?? lead.status}
                          onChange={(event) =>
                            setSelectedStatus((current) => ({ ...current, [lead.id]: event.target.value }))
                          }
                          className="rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-cyan-300"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleStatusUpdate(lead.id)}
                          className="rounded-full bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                        >
                          Wijzigen
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                      >
                        Bekijken
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kaartweergave op mobiel */}
          <div className="mt-4 space-y-3 sm:hidden">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="rounded-3xl border border-white/10 bg-[#090909] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{lead.naam}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(lead.created_at)}</p>
                  </div>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                    {lead.status}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-1 gap-1 text-sm text-slate-300">
                  <p>{lead.telefoon}</p>
                  <p>{lead.email}</p>
                  <p>{lead.plaats} · {lead.type_woning}</p>
                </dl>
                <button
                  onClick={() => onSelectLead(lead)}
                  className="mt-4 w-full rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                >
                  Bekijken →
                </button>
                <div className="mt-3 flex items-center gap-2">
                  <select
                    value={selectedStatus[lead.id] ?? lead.status}
                    onChange={(event) => setSelectedStatus((current) => ({ ...current, [lead.id]: event.target.value }))}
                    className="w-full rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-cyan-300"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleStatusUpdate(lead.id)}
                    className="shrink-0 rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Wijzigen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
