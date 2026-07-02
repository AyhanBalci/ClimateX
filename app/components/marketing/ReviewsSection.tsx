"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const reviews = [
  {
    naam: "Familie de Vries",
    initialen: "dV",
    plaats: "Utrecht",
    type: "Particulier – Gezinswoning",
    quote: "Binnen een week een laadpaal én duidelijk advies over load balancing. Top geregeld van begin tot eind.",
    rating: 5,
  },
  {
    naam: "Bedrijfspand Noord BV",
    initialen: "BN",
    plaats: "Amsterdam",
    type: "Zakelijk – 6 laadpunten",
    quote: "ClimateX heeft 6 laadpunten op ons terrein geïnstalleerd met slimme verdeling. Werkt feilloos.",
    rating: 5,
  },
  {
    naam: "VvE De Hoek",
    initialen: "VH",
    plaats: "Rotterdam",
    type: "VvE – 24 bewoners",
    quote: "Eerlijke verdeling van laadcapaciteit voor alle bewoners, prettig en transparant traject.",
    rating: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Reviews</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Wat klanten van ons zeggen.
          </h2>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-2xl font-semibold text-white">4,9</p>
          <p className="text-xs text-slate-500">gemiddelde beoordeling · 200+ reviews</p>
        </div>
      </motion.div>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {reviews.map((review, i) => (
          <motion.div
            key={review.naam}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-7 shadow-xl shadow-black/20"
          >
            <Quote className="absolute right-6 top-6 h-8 w-8 text-white/5" />
            <Stars count={review.rating} />
            <p className="mt-4 text-sm leading-7 text-slate-300">&ldquo;{review.quote}&rdquo;</p>
            <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/30 to-emerald-400/20 text-xs font-bold text-cyan-200">
                {review.initialen}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{review.naam}</p>
                <p className="text-xs text-slate-500">{review.plaats} · {review.type}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
