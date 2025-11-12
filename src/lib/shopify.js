import '@shopify/shopify-api/adapters/node';
import {ApiVersion, shopifyApi} from '@shopify/shopify-api';
import { PrismaSessionStorage } from './session-storage.js';

// Validate required environment variables
const requiredEnvVars = {
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_SECRET_KEY: process.env.SHOPIFY_SECRET_KEY,
  SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL,
};

console.log("requiredEnvVars",requiredEnvVars);

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}. ` +
    'Please set these variables in your .env file or environment.'
  );
}

// Initialize session storage
const sessionStorage = new PrismaSessionStorage();

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_SECRET_KEY, // or SHOPIFY_API_SECRET if you rename env
  scopes: [
    'read_products',
    'write_products',
    'read_orders',
    'write_orders',
    'read_gift_cards',
    'write_gift_cards',
  ],
  hostName: process.env.SHOPIFY_APP_URL.replace(/^https?:\/\//, '').replace(/\/$/, ''), // strip protocol + trailing slash
  apiVersion: ApiVersion.April24,
  isEmbeddedApp: true,
  sessionStorage,
});

export default shopify;