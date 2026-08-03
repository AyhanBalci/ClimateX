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
    ];
  },
};

export default nextConfig;
