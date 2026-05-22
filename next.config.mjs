/** @type {import('next').NextConfig} */
let nextConfig = {
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

console.log("DEBUG VERCEL LOG:", {
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  NODE_ENV: process.env.NODE_ENV
});

if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
  try {
    const withPWAInit = (await import("@ducanh2912/next-pwa")).default;
    const withPWA = withPWAInit({
      dest: "public",
      cacheOnFrontEndNav: true,
      aggressiveFrontEndNavCaching: true,
      reloadOnOnline: true,
      disable: process.env.NODE_ENV === "development",
      workboxOptions: {
        disableDevLogs: true,
      },
    });
    nextConfig = withPWA(nextConfig);
  } catch (error) {
    console.warn("No se pudo cargar @ducanh2912/next-pwa:", error);
  }
}

export default nextConfig;
