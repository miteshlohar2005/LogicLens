import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required: Excalidraw ships ESM that Next.js must transpile
  transpilePackages: ["@excalidraw/excalidraw"],

  // Excalidraw has known issues with React Strict Mode double-invoking effects
  reactStrictMode: false,
};

export default nextConfig;
