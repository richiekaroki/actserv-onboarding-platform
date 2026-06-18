// frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from the Django media server
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },

  // Expose the API URL to the browser bundle
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  },
};

export default nextConfig;