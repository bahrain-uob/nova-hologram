import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["books.google.com","books.s3.us-east-1.amazonaws.com",
      "storagestack-readingmaterials72d08c8-spmbioxypupt.s3.us-east-1.amazonaws.com"],
      
    unoptimized: true,
  },
};

export default nextConfig;
