import HomeClient from "./page-client";
import { supabase } from "./lib/supabase";
import { Product } from "./lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ClimateX — Premium airco oplossingen",
  description:
    "ClimateX levert luxe airco oplossingen in Nederland met hoogwaardige Daikin, LG Design en Gree Budget series. Premium, modern en perfect voor iedere ruimte.",
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
