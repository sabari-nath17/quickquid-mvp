import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
      allowedOrigins: [
        "quickquid-mvp.vercel.app",
        "localhost:3420",
      ],
    },
  },
};

export default nextConfig;
