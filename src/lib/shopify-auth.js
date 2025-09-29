import shopify from './shopify.js';
import { PrismaSessionStorage } from './session-storage.js';

const sessionStorage = new PrismaSessionStorage();

/**
 * Get an authenticated Shopify client for a shop
 * @param {string} shop - The shop domain
 * @returns {Object} Shopify REST or GraphQL client
 */
export async function getShopifyClient(shop) {
  const session = await sessionStorage.loadSession(shop);
  
  if (!session) {
    throw new Error(`No session found for shop: ${shop}`);
  }
  
  // Check if session is expired
  if (session.expires && new Date() > new Date(session.expires)) {
    await sessionStorage.deleteSession(shop);
    throw new Error(`Session expired for shop: ${shop}`);
  }
  
  return {
    rest: new shopify.clients.Rest({ session }),
    graphql: new shopify.clients.Graphql({ session }),
    session
  };
}

/**
 * Verify if a shop has a valid session
 * @param {string} shop - The shop domain
 * @returns {boolean} Whether the session is valid
 */
export async function hasValidSession(shop) {
  try {
    const session = await sessionStorage.loadSession(shop);
    
    if (!session) return false;
    
    // Check if session is expired
    if (session.expires && new Date() > new Date(session.expires)) {
      await sessionStorage.deleteSession(shop);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
}

/**
 * Get session data for a shop
 * @param {string} shop - The shop domain
 * @returns {Object|null} Session data or null if not found
 */
export async function getSession(shop) {
  return await sessionStorage.loadSession(shop);
}

/**
 * Remove session for a shop
 * @param {string} shop - The shop domain
 * @returns {boolean} Whether the deletion was successful
 */
export async function removeSession(shop) {
  return await sessionStorage.deleteSession(shop);
}