// next.config.js
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the origin for development
  allowedDevOrigins: ['dd-19.dynamicdreamz.com'],
  // Other configurations...
};

export default nextConfig;