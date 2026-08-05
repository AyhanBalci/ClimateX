import Link from "next/link";
import { FileText, ShieldCheck, Wrench, BookOpen, Mail } from "lucide-react";
import { DownloadItem, DownloadType } from "../../lib/producten/types";

const ICONS: Record<DownloadType, typeof FileText> = {
  datasheet: FileText,
  handleiding: BookOpen,
  installatie: Wrench,
  garantie: ShieldCheck,
};

/**
 * Zolang de definitieve PDF's ontbreken tonen we geen downloadknoppen die niets
 * doen. In plaats daarvan staat er wat er beschikbaar is en hoe men het opvraagt;
 * zodra de bestanden er zijn kan dit onderdeel echte links renderen.
 */
export default function DownloadsList({ downloads }: { downloads: DownloadItem[] }) {
  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {downloads.map((d) => {
          const Icon = ICONS[d.type];
          return (
            <li
              key={d.label}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-sm text-slate-300"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 leading-5">{d.label}</span>
              <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                Op aanvraag
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
        <Mail className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
        Documentatie nodig voor uw beslissing of installatie?
        <Link href="/#contact" className="font-medium text-cyan-300 underline underline-offset-4 hover:text-cyan-200">
          Vraag de documenten op
        </Link>
        — u ontvangt ze per e-mail.
      </p>
    </div>
  );
}
