import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Capacitor when needed
  output: process.env.BUILD_TARGET === 'capacitor' ? 'export' : undefined,
  
  // Disable image optimization for Capacitor builds
  images: {
    unoptimized: process.env.BUILD_TARGET === 'capacitor',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  
  // Add trailing slash for better Capacitor compatibility
  trailingSlash: true,
  
  // Use relative paths for Capacitor
  assetPrefix: process.env.BUILD_TARGET === 'capacitor' ? './' : undefined,
  
  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
