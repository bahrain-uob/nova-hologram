import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["books.google.com","books.s3.us-east-1.amazonaws.com",
      "storagestack-readingmaterials72d08c8-spmbioxypupt.s3.us-east-1.amazonaws.com"],
    unoptimized: true,
  },
  // Enable experimental features that might help with route handler type compatibility
  experimental: {
    typedRoutes: true,
    serverActions: { allowedOrigins: ['*'] }
  },
};

export default nextConfig;
