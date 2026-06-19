export type FeaturedProduct = {
  slug: string;
  brand: string;
  title: string;
  shortDescription: string;
  coolingHeating: string;
  energyLabel: string;
  priceLabel: string;
};

export const featuredProducts: FeaturedProduct[] = [
  {
    slug: "daikin-stylish-ftxa35aw",
    brand: "Daikin",
    title: "Daikin Stylish FTXA35AW",
    shortDescription:
      "Premium designunit met strakke afwerking, stille werking en uitstekend rendement voor middelgrote ruimtes.",
    coolingHeating: "Koelen en verwarmen",
    energyLabel: "A+++ (koelen) / A+++ (verwarmen)",
    priceLabel: "€2.199 indicatieprijs incl. montage",
  },
  {
    slug: "lg-artcool-mirror-ac12bk",
    brand: "LG",
    title: "LG Artcool Mirror AC12BK",
    shortDescription:
      "Stijlvolle spiegelunit met discrete uitstraling, smart control en betrouwbare prestaties.",
    coolingHeating: "Koelen en verwarmen",
    energyLabel: "A++ (koelen) / A+ (verwarmen)",
    priceLabel: "€1.899 indicatieprijs incl. montage",
  },
  {
    slug: "gree-fairy-gwh12acc",
    brand: "Gree",
    title: "Gree Fairy GWH12ACC",
    shortDescription:
      "Compacte en betaalbare unit met slimme wifi-bediening, geschikt voor slaapkamers en kleinere ruimtes.",
    coolingHeating: "Koelen en verwarmen",
    energyLabel: "A++ (koelen) / A+ (verwarmen)",
    priceLabel: "€1.599 indicatieprijs incl. montage",
  },
];
