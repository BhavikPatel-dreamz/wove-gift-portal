import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add turbopack config to resolve build issues
  turbopack: {},
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb', // default is 1mb, increase as needed
    },
  },
  images: {
    remotePatterns: [
       {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // replace this with your actual origin in production
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Ensure fallback object exists
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                dns: false,
                net: false
            };
        }
        return config;
    },
};
  
  export default nextConfig;
  