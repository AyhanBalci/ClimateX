import HomeClient from "./page-client";
import { supabase } from "./lib/supabase";
import { Product } from "./lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ClimateX — Laadpaal thuis of zakelijk installeren",
  description:
    "ClimateX installeert premium laadpalen voor woningen, bedrijven en VvE's met load balancing en dynamic load balancing. Vraag een gratis offerte aan voor uw laadpaal.",
};

export default async function Home() {
  let products: Product[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("producten")
      .select("*")
      .eq("actief", true)
      .order("merk", { ascending: true })
      .order("model", { ascending: true })
      .limit(3);
    products = (data as Product[]) || [];
  }

  return <HomeClient products={products} />;
}
