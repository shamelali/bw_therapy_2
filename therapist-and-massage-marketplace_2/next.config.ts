import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local images under /public are served in-process; no external hosts needed.
    // If you later point imageUrl/avatarUrl at an external CDN, add its host here.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
};

export default nextConfig;
