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
  },
};

export default nextConfig;
