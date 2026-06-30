"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  { naam: "Familie de Vries", plaats: "Utrecht", quote: "Binnen een week een laadpaal én duidelijk advies over load balancing. Top geregeld van begin tot eind." },
  { naam: "Bedrijfspand Noord BV", plaats: "Amsterdam", quote: "ClimateX heeft 6 laadpunten op ons terrein geïnstalleerd met slimme verdeling. Werkt feilloos." },
  { naam: "VvE De Hoek", plaats: "Rotterdam", quote: "Eerlijke verdeling van laadcapaciteit voor alle bewoners, prettig en transparant traject." },
];

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
            Wat klanten van ClimateX zeggen.
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          4,9 / 5 gemiddelde beoordeling
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
            whileHover={{ y: -4 }}
            className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-7"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">&ldquo;{review.quote}&rdquo;</p>
            <p className="mt-5 text-sm font-semibold text-white">{review.naam}</p>
            <p className="text-xs text-slate-500">{review.plaats}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
