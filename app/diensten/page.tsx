import DienstenClient from "./DienstenClient";
import JsonLd from "../components/seo/JsonLd";
import { serviceJsonLd } from "../lib/seo";

export const metadata = {
  title: "Diensten | Laadpalen voor thuis, zakelijk en VvE",
  description:
    "Van laadpaal thuis tot zakelijke laadoplossingen, load balancing, onderhoud en storingsdienst. Bekijk alle diensten van ClimateX.",
  alternates: { canonical: "/diensten" },
};

export default function DienstenPage() {
  return (
    <>
      <JsonLd data={serviceJsonLd()} />
      <DienstenClient />
    </>
  );
}
