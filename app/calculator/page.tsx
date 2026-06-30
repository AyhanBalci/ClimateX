import CalculatorClient from "./CalculatorClient";

export const metadata = {
  title: "Laadpaal calculator | Prijs, besparing en advies",
  description:
    "Bereken direct uw indicatieprijs, jaarlijkse besparing en de beste laadpaal voor uw situatie. Vergelijk merken en vraag een gratis meterkastbeoordeling aan.",
};

export default function CalculatorPage() {
  return <CalculatorClient />;
}
