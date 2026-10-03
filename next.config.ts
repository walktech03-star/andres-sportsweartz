import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allows the QR picture service used by the admin QR dashboard.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.qrserver.com" },
    ],
  },
};

export default nextConfig;
