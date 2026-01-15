import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yahoofantasysports-res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "s.yimg.com",
      },
    ],
  },
};

export default nextConfig;
