export default function ProductImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="mb-4 flex h-40 flex-col items-center justify-center gap-1 rounded-[1.5rem] border border-dashed border-white/15 bg-slate-900/90 px-4 text-center">
      <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Productfoto volgt</span>
      <span className="text-sm text-slate-300">{label}</span>
    </div>
  );
}
