import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: {
    position: "bottom-right",
  },
  experimental: {
    serverActions: {
      // Above the 1 Mo limit of a Page's Contenu, so the Pages module is the one refusing it
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
