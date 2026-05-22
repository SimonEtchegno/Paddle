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

// En Vercel no necesitamos generar el PWA durante la fase de build si está dando errores de path,
// o si queremos aislar y asegurar la compilación.
if (!process.env.VERCEL) {
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
