/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ Supprimer formats: [] complètement
    qualities: [75],
    unoptimized: true,
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