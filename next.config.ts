import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/products",
        destination: "/producten",
        permanent: true,
      },
      {
        source: "/products/:slug",
        destination: "/producten",
        permanent: true,
      },
      {
        // De reviewpagina is verwijderd tot er geverifieerde klantbeoordelingen zijn.
        source: "/reviews",
        destination: "/waarom-climatex",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
