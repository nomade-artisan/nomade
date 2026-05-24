/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Désactiver les formats automatiques car toutes les images sont déjà en WebP
    formats: [],
    // Garder uniquement la qualité standard utilisée
    qualities: [75],
    // Désactiver l'optimisation coûteuse des images externes (elles sont déjà optimisées)
    unoptimized: true,
    // Autoriser uniquement ton domaine Supabase
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hsfxhydtrntmublewdmq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;