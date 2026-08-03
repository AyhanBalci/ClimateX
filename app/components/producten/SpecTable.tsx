import { CheckCircle2, XCircle } from "lucide-react";
import { Product } from "../../lib/producten/types";

function BoolRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
      <span className="text-slate-500">{label}</span>
      {value ? (
        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Ja
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 font-medium text-slate-500">
          <XCircle className="h-4 w-4" /> Nee
        </span>
      )}
    </div>
  );
}

function TextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}

export default function SpecTable({ product }: { product: Product }) {
  const { specs } = product;
  const rows = [
    <TextRow key="vermogen" label="Laadvermogen" value={specs.vermogenLabel} />,
    <TextRow key="fase" label="1-fase / 3-fase" value={specs.fase} />,
    <TextRow key="kabel" label="Kabel" value={specs.kabel === "vast" ? `Vaste kabel${specs.kabellengteM ? ` (${specs.kabellengteM} m)` : ""}` : specs.kabel === "los" ? "Los (type 2 stopcontact)" : "Vast of los leverbaar"} />,
    <BoolRow key="rfid" label="RFID-ondersteuning" value={specs.rfid} />,
    <BoolRow key="lb" label="Load balancing" value={specs.loadBalancing} />,
    <BoolRow key="dlb" label="Dynamic load balancing" value={specs.dynamicLoadBalancing} />,
    <BoolRow key="mid" label="MID-meter" value={specs.midMeter} />,
    <BoolRow key="app" label="App-ondersteuning" value={specs.app} />,
    <TextRow key="conn" label="Connectiviteit" value={specs.connectiviteit.map((c) => c.toUpperCase()).join(" / ")} />,
    <TextRow key="garantie" label="Garantie" value={specs.garantieLabel} />,
    <TextRow key="installatietijd" label="Installatietijd" value={specs.installatietijd} />,
    <BoolRow key="installatie" label="Installatie inbegrepen" value={specs.installatieInbegrepen} />,
    <TextRow key="ip" label="Beschermingsgraad" value={specs.beschermingsgraad} />,
    <TextRow key="afmetingen" label="Afmetingen" value={specs.afmetingen} />,
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      {rows.map((row, i) => (
        <div key={row.key} className={i % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"}>
          {row}
        </div>
      ))}
    </div>
  );
}
