import ReviewsClient from "./ReviewsClient";

export const metadata = {
  title: "Reviews | Wat klanten zeggen over ClimateX",
  description:
    "Lees wat klanten zeggen over ClimateX — gecertificeerde laadpaal installateur met een 4,9/5 beoordeling. Particulieren, bedrijven en VvE's aan het woord.",
};

export default function ReviewsPage() {
  return <ReviewsClient />;
}
