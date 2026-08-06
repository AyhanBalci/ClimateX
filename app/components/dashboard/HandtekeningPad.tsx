"use client";

import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";

type Props = {
  label: string;
  /** Bestaande handtekening als data-URL, of een oude getypte naam. */
  waarde: string;
  onChange: (waarde: string) => void;
};

/**
 * Laat een handtekening met de vinger of muis zetten en bewaart die als PNG
 * data-URL in hetzelfde tekstveld dat er al was.
 *
 * Bestaande werkbonnen hebben in dat veld een getypte naam staan. Die wordt
 * daarom niet weggegooid maar gewoon getoond: een oude werkbon opnieuw openen
 * mag zijn ondertekening niet verliezen.
 */
export default function HandtekeningPad({ label, waarde, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tekentRef = useRef(false);
  const [tekentNu, setTekentNu] = useState(false);

  const isAfbeelding = waarde.startsWith("data:image");
  // Een oude, getypte handtekening. Geen afbeelding, maar wel ondertekend.
  const isGetypteNaam = Boolean(waarde) && !isAfbeelding;

  // Het canvas krijgt zijn tekenoppervlak pas als het zichtbaar is. Zonder deze
  // stap tekent de browser op een standaard 300x150 vlak en staat de lijn
  // verschoven ten opzichte van de vinger.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isAfbeelding) return;

    const schaal = window.devicePixelRatio || 1;
    const breedte = canvas.clientWidth;
    const hoogte = canvas.clientHeight;
    canvas.width = breedte * schaal;
    canvas.height = hoogte * schaal;

    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(schaal, schaal);
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#ffffff";
  }, [isAfbeelding]);

  const positie = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rand = canvas.getBoundingClientRect();
    return { x: event.clientX - rand.left, y: event.clientY - rand.top };
  };

  const startTekenen = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    // De pointer vasthouden, zodat een streek die buiten het vak eindigt niet
    // halverwege afbreekt.
    canvasRef.current?.setPointerCapture(event.pointerId);
    tekentRef.current = true;
    setTekentNu(true);
    const { x, y } = positie(event);
    context.beginPath();
    context.moveTo(x, y);
  };

  const teken = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!tekentRef.current) return;
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const { x, y } = positie(event);
    context.lineTo(x, y);
    context.stroke();
  };

  const stopTekenen = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!tekentRef.current) return;
    tekentRef.current = false;
    setTekentNu(false);
    canvasRef.current?.releasePointerCapture(event.pointerId);
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  };

  const wissen = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    onChange("");
  };

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>

      {isAfbeelding ? (
        <div className="mt-2 rounded-3xl border border-white/10 bg-black/40 p-3">
          {/* Een handtekening is een data-URL uit deze app zelf; next/image
              voegt hier niets toe en kan er niet mee overweg. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={waarde} alt={`${label}: gezette handtekening`} className="h-28 w-full object-contain" />
        </div>
      ) : (
        <div className="mt-2 rounded-3xl border border-white/10 bg-black/40 p-1">
          <canvas
            ref={canvasRef}
            onPointerDown={startTekenen}
            onPointerMove={teken}
            onPointerUp={stopTekenen}
            onPointerLeave={stopTekenen}
            aria-label={`${label}: teken hier de handtekening`}
            className={`h-28 w-full touch-none rounded-[1.25rem] ${tekentNu ? "cursor-crosshair" : "cursor-crosshair"}`}
          />
        </div>
      )}

      {isGetypteNaam ? (
        <p className="mt-2 text-xs text-slate-400">
          Eerder ondertekend met de naam &ldquo;{waarde}&rdquo;. Wis om opnieuw te tekenen.
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={wissen}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10"
        >
          Wissen
        </button>
        {!waarde ? <p className="self-center text-xs text-slate-500">Nog niet ondertekend</p> : null}
      </div>
    </div>
  );
}
