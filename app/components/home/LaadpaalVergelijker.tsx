import ProductComparison from "../producten/ProductComparison";
import { ALL_PRODUCTS } from "../../lib/producten/helpers";

// Eén representatief (bestseller) model per merk, zodat de calculator-tab een
// compact overzicht toont. Volledige vergelijking staat op /producten.
const VLAGGENSCHEPEN = ["alfen/eve-single-pro-line", "ratio/solar-mid-4g", "easee/charge-up", "wallbox/pulsar-plus", "zaptec/go"];

export default function LaadpaalVergelijker() {
  return <ProductComparison products={ALL_PRODUCTS} defaultSelected={VLAGGENSCHEPEN} />;
}
