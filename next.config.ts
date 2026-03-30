import type { NextConfig } from "next";

const SHOPIFY_CSP =
  "frame-ancestors https://admin.shopify.com https://*.myshopify.com;";

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow all HTTPS domains
      },
      {
        protocol: "http",
        hostname: "**", // Allow all HTTP domains (optional, use with caution)
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/shopify/:path*",
        headers: [
          { key: "Content-Security-Policy", value: SHOPIFY_CSP },
          // Legacy fallback for older browsers / Safari
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://admin.shopify.com",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
      config.resolve.fallback.dns = false;
      config.resolve.fallback.net = false;
    }
    return config;
  },
};

export default nextConfig;
