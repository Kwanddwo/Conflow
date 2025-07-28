import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Disable ESLint on build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
