import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
  serverActions: {
    bodySizeLimit: '20mb', // default is 1mb, increase as needed
  }
}
};

export default nextConfig;
