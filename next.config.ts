import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Phosphor is a barrel over ~9,000 icon modules. Without this, importing
  // two icons pulls the entire set into the compile.
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
  },
};

export default nextConfig;
