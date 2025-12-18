import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "matcha.fr",
        port: "",
        pathname: "/api/private/uploads/**",
      },
    ],
    domains: ["localhost", "matcha.fr", "mduvey.matcha.fr"]
  },
};

export default nextConfig;
