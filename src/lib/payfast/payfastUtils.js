/**
 * PayFast Payment Utility
 * Uses Web Crypto API (modern replacement for deprecated crypto npm package)
 */

/**
 * Generate MD5 hash using Web Crypto API
 * @param {string} data - Data to hash
 * @returns {Promise<string>} MD5 hash
 */
async function generateMD5Hash(data) {
  // Convert string to ArrayBuffer
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Generate hash using SubtleCrypto (available in Node.js 15+)
  const hashBuffer = await crypto.subtle.digest('MD5', dataBuffer);
  
  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Alternative: Use Node.js built-in crypto module (recommended)
 */
import { createHash } from 'crypto';

function generateMD5HashSync(data) {
  return createHash('md5').update(data).digest('hex');
}

/**
 * Generate PayFast signature
 * @param {Object} data - Payment parameters
 * @param {string} passphrase - PayFast passphrase (optional but recommended)
 * @returns {string} MD5 signature
 */
export function generatePayFastSignature(data, passphrase = '') {
  // Create parameter string
  let paramString = '';
  
  // Sort keys alphabetically (PayFast requirement)
  const sortedKeys = Object.keys(data).sort();
  
  sortedKeys.forEach(key => {
    const value = data[key];
    if (value !== '' && value !== null && value !== undefined) {
      // URL encode the value
      paramString += `${key}=${encodeURIComponent(value.toString().trim()).replace(/%20/g, '+')}&`;
    }
  });
  
  // Remove last ampersand
  paramString = paramString.slice(0, -1);
  
  // Add passphrase if provided
  if (passphrase) {
    paramString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }
  
  // Generate MD5 hash
  return generateMD5HashSync(paramString);
}

/**
 * Validate PayFast callback signature
 * @param {Object} postData - POST data from PayFast
 * @param {string} passphrase - PayFast passphrase
 * @returns {boolean} Signature is valid
 */
export function validatePayFastSignature(postData, passphrase = '') {
  const receivedSignature = postData.signature;
  delete postData.signature;
  
  const calculatedSignature = generatePayFastSignature(postData, passphrase);
  
  return receivedSignature === calculatedSignature;
}

/**
 * Build PayFast payment data
 * @param {Object} orderData - Order information
 * @param {Object} config - PayFast configuration
 * @returns {Object} PayFast payment parameters
 */
export function buildPayFastData(orderData, config) {
  const {
    merchantId,
    merchantKey,
    passphrase,
    returnUrl,
    cancelUrl,
    notifyUrl,
  } = config;
  
  const paymentData = {
    // Merchant details
    merchant_id: merchantId,
    merchant_key: merchantKey,
    
    // Transaction details
    amount: (orderData.totalAmount / 100).toFixed(2), // Convert cents to rands
    item_name: orderData.itemName || 'Gift Card Purchase',
    item_description: orderData.description || `Order ${orderData.orderNumber}`,
    
    // Custom fields (optional, max 5)
    custom_str1: orderData.orderId,
    custom_str2: orderData.orderNumber,
    custom_str3: orderData.isBulkOrder ? 'BULK' : 'SINGLE',
    custom_int1: orderData.quantity || 1,
    
    // Buyer details
    name_first: orderData.firstName || 'Customer',
    name_last: orderData.lastName || '',
    email_address: orderData.email,
    
    // Transaction options
    payment_method: 'cc,dc,eft', // Credit card, debit card, EFT
    
    // URLs
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    
    // Email confirmation (optional)
    email_confirmation: 1,
    confirmation_address: orderData.email,
  };
  
  // Generate signature
  paymentData.signature = generatePayFastSignature(paymentData, passphrase);
  
  return paymentData;
}

/**
 * Get PayFast payment URL
 * @param {boolean} isSandbox - Use sandbox environment
 * @returns {string} PayFast URL
 */
export function getPayFastUrl(isSandbox = false) {
  return isSandbox 
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';
}

/**
 * Verify PayFast payment from server callback
 * @param {Object} postData - POST data from PayFast
 * @param {string} passphrase - PayFast passphrase
 * @returns {Promise<Object>} Validation result
 */
export async function verifyPayFastPayment(postData, passphrase) {
  try {
    // 1. Verify signature
    const signatureValid = validatePayFastSignature({ ...postData }, passphrase);
    
    if (!signatureValid) {
      return {
        valid: false,
        error: 'Invalid signature',
      };
    }
    
    // 2. Verify payment status
    if (postData.payment_status !== 'COMPLETE') {
      return {
        valid: false,
        error: `Payment not complete. Status: ${postData.payment_status}`,
      };
    }
    
    // 3. Verify amount (optional but recommended)
    // You should verify this matches your order amount
    
    return {
      valid: true,
      data: {
        paymentId: postData.pf_payment_id,
        orderId: postData.custom_str1,
        orderNumber: postData.custom_str2,
        amount: parseFloat(postData.amount_gross),
        fee: parseFloat(postData.amount_fee || 0),
        net: parseFloat(postData.amount_net || 0),
        status: postData.payment_status,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    };
  }
}

/**
 * PayFast payment statuses
 */
export const PAYFAST_STATUS = {
  COMPLETE: 'COMPLETE',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
};

/**
 * Get PayFast configuration from environment
 */
export function getPayFastConfig() {
  const isSandbox = process.env.PAYFAST_SANDBOX === 'true';
  
  return {
    merchantId: isSandbox 
      ? process.env.PAYFAST_SANDBOX_MERCHANT_ID 
      : process.env.PAYFAST_MERCHANT_ID,
    merchantKey: isSandbox 
      ? process.env.PAYFAST_SANDBOX_MERCHANT_KEY 
      : process.env.PAYFAST_MERCHANT_KEY,
    passphrase: process.env.PAYFAST_PASSPHRASE,
    isSandbox,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
    notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/payfast`,
  };
}