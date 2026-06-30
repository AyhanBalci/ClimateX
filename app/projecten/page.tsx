import ProjectenClient from "./ProjectenClient";

export const metadata = {
  title: "Projecten | Gerealiseerde laadpaalinstallaties",
  description:
    "Een overzicht van gerealiseerde laadpaalprojecten van ClimateX voor woningen, bedrijven en VvE's, inclusief load balancing en dynamic load balancing.",
};

export default function ProjectenPage() {
  return <ProjectenClient />;
}
