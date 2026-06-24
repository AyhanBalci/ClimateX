"use client";

import { Planning, Werkbon } from "../../lib/types";

type Props = {
  werkbon: Werkbon | null;
  planning: Planning | null;
  onOpenWerkbon: (werkbon: Werkbon) => void;
  onOpenPlanning: (planning: Planning) => void;
};

export default function OfferteKoppelingen({ werkbon, planning, onOpenWerkbon, onOpenPlanning }: Props) {
  if (!werkbon) {
    return <p className="text-xs text-slate-500">Werkbon en planning worden automatisch aangemaakt...</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onOpenWerkbon(werkbon)}
        className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
      >
        Bekijk werkbon {werkbon.werkbonnummer}
      </button>
      {planning ? (
        <button
          onClick={() => onOpenPlanning(planning)}
          className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
        >
          Bekijk planning {planning.planning_nummer}
        </button>
      ) : null}
    </div>
  );
}
