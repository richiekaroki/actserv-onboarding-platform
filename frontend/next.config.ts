// frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Allow images from the Django media server
  // In production, set NEXT_PUBLIC_MEDIA_PROTOCOL, NEXT_PUBLIC_MEDIA_HOST
  images: {
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_MEDIA_PROTOCOL === "https" ? "https" : "http",
        hostname: process.env.NEXT_PUBLIC_MEDIA_HOST || "localhost",
        port: process.env.NEXT_PUBLIC_MEDIA_HOST ? undefined : "8000",
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