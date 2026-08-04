import ProjectenClient from "./ProjectenClient";

export const metadata = {
  title: "Voorbeeldsituaties | Zo verloopt een laadpaalinstallatie",
  description:
    "Representatieve installatiesituaties voor woningen, bedrijven en VvE's: van load balancing op een 1-fase aansluiting tot MID-meting per laadpunt.",
  alternates: { canonical: "/projecten" },
};

export default function ProjectenPage() {
  return <ProjectenClient />;
}
