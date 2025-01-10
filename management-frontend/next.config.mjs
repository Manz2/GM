/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: '/management-frontend', // Präfix für statische Assets
  output: 'standalone',
  images: {
    unoptimized: true, // Deaktiviert die Optimierung vollständig (falls notwendig)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Alle Domains erlauben
      },
    ],
  },
};

export default nextConfig;
