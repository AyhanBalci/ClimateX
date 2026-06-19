import { Lead } from "../../lib/types";

export default function DashboardStats({ leads }: { leads: Lead[] }) {
  const total = leads.length;
  const countByStatus = (status: string) => leads.filter((lead) => lead.status === status).length;

  const nieuw = countByStatus("Nieuw");
  const gebeld = countByStatus("Gebeld");
  const offerteVerstuurd = countByStatus("Offerte verstuurd");
  const gewonnen = countByStatus("Gewonnen");
  const verloren = countByStatus("Verloren");
  const conversie = total > 0 ? Math.round((gewonnen / total) * 1000) / 10 : 0;

  const stats = [
    { label: "Nieuwe leads", value: nieuw },
    { label: "Gebeld", value: gebeld },
    { label: "Offertes verstuurd", value: offerteVerstuurd },
    { label: "Gewonnen", value: gewonnen },
    { label: "Verloren", value: verloren },
    { label: "Conversiepercentage", value: `${conversie}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-3xl border border-white/10 bg-[#090909] p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
