import { FileText, ShieldCheck, Wrench, BookOpen } from "lucide-react";
import { DownloadItem, DownloadType } from "../../lib/producten/types";

const ICONS: Record<DownloadType, typeof FileText> = {
  datasheet: FileText,
  handleiding: BookOpen,
  installatie: Wrench,
  garantie: ShieldCheck,
};

export default function DownloadsList({ downloads }: { downloads: DownloadItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {downloads.map((d) => {
        const Icon = ICONS[d.type];
        return (
          <div
            key={d.label}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-sm text-slate-300"
            title="PDF volgt — beschikbaar zodra de definitieve documentatie is toegevoegd"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex-1 leading-5">{d.label}</span>
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">PDF volgt</span>
          </div>
        );
      })}
    </div>
  );
}
