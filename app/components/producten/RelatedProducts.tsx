import { ProductWithBrand } from "../../lib/producten/types";
import ProductCard from "./ProductCard";

export default function RelatedProducts({ products }: { products: ProductWithBrand[] }) {
  if (products.length === 0) return null;
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={`${p.merkSlug}-${p.productSlug}`} product={p} />
      ))}
    </div>
  );
}
