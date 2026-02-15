import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

const withPWA = withPWAInit({
  dest: "public",       // সার্ভিস ওয়ার্কার কোথায় তৈরি হবে
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development", // ডেভেলপমেন্ট মোডে PWA বন্ধ থাকবে
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default withPWA(nextConfig);