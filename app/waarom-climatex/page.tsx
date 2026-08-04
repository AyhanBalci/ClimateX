import WaaromClimatexClient from "./WaaromClimatexClient";

export const metadata = {
  title: "Waarom ClimateX | Gecertificeerd laadpaal installateur",
  description:
    "Ontdek waarom klanten voor ClimateX kiezen. NEN 1010 gecertificeerde monteurs, vaste prijzen vooraf, gratis inspectie en uitgebreide garantie op laadpalen voor thuis, zakelijk en VvE.",
  alternates: { canonical: "/waarom-climatex" },
};

export default function WaaromClimatexPage() {
  return <WaaromClimatexClient />;
}
