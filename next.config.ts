import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/padel',
        destination: '/padel',
      },
      {
        source: '/futbol',
        destination: '/futbol',
      },
    ];
  },
};

export default nextConfig;
