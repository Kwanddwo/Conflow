import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Don't run ESLint during `next build`
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
