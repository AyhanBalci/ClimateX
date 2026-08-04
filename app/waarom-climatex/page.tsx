import WaaromClimatexClient from "./WaaromClimatexClient";

export const metadata = {
  title: "Waarom ClimateX | Gecertificeerd laadpaal installateur",
  description:
    "Ontdek waarom 500+ klanten voor ClimateX kiezen. Gecertificeerde monteurs, vaste prijzen, gratis inspectie en uitgebreide garantie op laadpalen voor thuis, zakelijk en VvE.",
  alternates: { canonical: "/waarom-climatex" },
};

export default function WaaromClimatexPage() {
  return <WaaromClimatexClient />;
}
