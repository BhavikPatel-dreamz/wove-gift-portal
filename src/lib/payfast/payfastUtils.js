import { createHash } from "crypto";

/**
 * Generate PayFast signature
 * The string to hash includes the passphrase at the end
 */
export function generateSignature(data, passPhrase = null) {
  const cleanData = { ...data };
  delete cleanData.signature;

  const orderedKeys = [
    "merchant_id",
    "merchant_key",
    "return_url",
    "cancel_url",
    "notify_url",
    "name_first",
    "name_last",
    "email_address",
    "email_confirmation",
    "confirmation_address",
    "amount",
    "item_name",
    "item_description",
    "custom_str1",
    "custom_str2",
    "custom_str3",
    "custom_int1",
    "m_payment_id",
  ];

  const parts = [];

  for (const key of orderedKeys) {
    if (
      cleanData[key] !== undefined &&
      cleanData[key] !== null &&
      cleanData[key] !== ""
    ) {
      let stringVal = String(cleanData[key]).trim();
      const encodedVal = encodeURIComponent(stringVal).replace(/%20/g, "+");
      parts.push(`${key}=${encodedVal}`);
    }
  }

  let getString = parts.join("&");

  // Add passphrase parameter at the end
  if (passPhrase && String(passPhrase).trim() !== "") {
    const passphraseStr = String(passPhrase).trim();
    getString += `&passphrase=${passphraseStr}`;
  }

  const signature = createHash("md5").update(getString).digest("hex");

  return {
    signature,
    stringToHash: getString, // This is what you want to use for redirect
  };
}

/**
 * Build PayFast URL - Direct redirect with string that was hashed
 */
export function buildPayFastUrlDirect(
  paymentData,
  passphrase,
  isSandbox = false,
) {
  const baseUrl = isSandbox
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";

  // Generate the string that was hashed (includes passphrase)
  const { stringToHash } = generateSignature(paymentData, passphrase);

  // Direct redirect with the complete string
  const finalUrl = `${baseUrl}?${stringToHash}`;

  console.log("🔗 Direct PayFast URL (with passphrase):");
  console.log(finalUrl);

  return finalUrl;
}

/**
 * Build PayFast payment payload
 */
/**
 * Build PayFast payment payload
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

  console.log("🔧 Building PayFast payment data...", orderData.totalAmount);

  // Include 5% fee in totalAmount
  const amountWithFee = Math.ceil(Number(orderData.totalAmount) * 1.05);

  // Convert to Rands with 2 decimal places
  const amountInRands = amountWithFee.toFixed(2);

  const paymentData = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    name_first: orderData.firstName || "",
    name_last: orderData.lastName || "",
    email_address: orderData.email || "",
    email_confirmation: orderData.email ? 1 : 0,
    confirmation_address: orderData.email || "",
    amount: amountInRands, // This should be Rands, not cents
    item_name: (orderData.itemName || "Gift Card Purchase")
      .trim()
      .replace(/\s+/g, " "),
    item_description: (orderData.description || "").trim().replace(/\s+/g, " "),
    custom_str1: orderData.orderId || "",
    custom_str2: orderData.orderNumber || "",
    custom_str3:
      orderData.isBulkOrder !== undefined
        ? orderData.isBulkOrder
          ? "BULK"
          : "SINGLE"
        : "",
    custom_int1: orderData.quantity ? String(orderData.quantity) : "",
    m_payment_id: orderData.orderId || "",
  };

  // Remove empty values
  const cleanData = {};
  for (const key in paymentData) {
    if (
      paymentData[key] !== "" &&
      paymentData[key] !== null &&
      paymentData[key] !== undefined
    ) {
      cleanData[key] = paymentData[key];
    }
  }

  console.log("📦 Clean payment data:");
  console.log(JSON.stringify(cleanData, null, 2));

  // Generate signature (passphrase is included in hash but NOT in cleanData)
  const { signature, stringToHash } = generateSignature(cleanData, passphrase);

  console.log("🔐 Signature generated:", signature);
  console.log("📝 String that was hashed:", stringToHash);

  // Add signature to data
  cleanData.signature = signature;

  return cleanData;
}

/**
 * Build PayFast URL - DOES NOT include passphrase in URL
 * The passphrase is only used for signature generation
 */
/**
 * Build PayFast URL - DOES NOT include passphrase in URL
 * The passphrase is only used for signature generation
 */
export function buildPayFastUrl(paymentData, passphrase, isSandbox = false) {
  const baseUrl = getPayFastUrl(isSandbox);

  // Use the same order as generateSignature
  const orderedKeys = [
    "merchant_id",
    "merchant_key",
    "return_url",
    "cancel_url",
    "notify_url",
    "name_first",
    "name_last",
    "email_address",
    "email_confirmation",
    "confirmation_address",
    "amount",
    "item_name",
    "item_description",
    "custom_str1",
    "custom_str2",
    "custom_str3",
    "custom_int1",
    "m_payment_id",
  ];

  const parts = [];

  for (const key of orderedKeys) {
    if (
      paymentData[key] !== undefined &&
      paymentData[key] !== null &&
      paymentData[key] !== ""
    ) {
      let stringVal = String(paymentData[key]).trim();
      const encodedVal = encodeURIComponent(stringVal).replace(/%20/g, "+");
      parts.push(`${key}=${encodedVal}`);
    }
  }

  // Add passphrase at the end
  if (passphrase && String(passphrase).trim() !== "") {
    const passphraseStr = String(passphrase).trim();
    const encodedPassphrase = encodeURIComponent(passphraseStr).replace(
      /%20/g,
      "+",
    );
    parts.push(`passphrase=${encodedPassphrase}`);
  }

  const finalUrl = `${baseUrl}?${parts.join("&")}`;

  console.log("🔗 Direct PayFast URL (with passphrase, no signature):");
  console.log(finalUrl);

  return finalUrl;
}

/**
 * Get PayFast base URL
 */
export function getPayFastUrl(isSandbox = false) {
  return isSandbox
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";
}

/**
 * Validate PayFast ITN signature - SIMPLE VERSION
 * PayFast sends ALL parameters in alphabetical order
 */
export function validatePayFastSignature(postData, passphrase = "") {
  const receivedSignature = postData.signature;

  if (!receivedSignature) {
    console.error("❌ No signature in POST data");
    return false;
  }

  // 1. Remove signature from the data
  const dataWithoutSignature = { ...postData };
  delete dataWithoutSignature.signature;

  // 2. Get ALL keys (not just your predefined ones) and sort alphabetically
  const allKeys = Object.keys(dataWithoutSignature).sort();

  console.log("🔍 All parameters from PayFast:");
  allKeys.forEach((key) => {
    console.log(`  ${key}: ${dataWithoutSignature[key]}`);
  });

  // 3. Build the string EXACTLY as PayFast does
  const parts = [];

  for (const key of allKeys) {
    const value = dataWithoutSignature[key];
    if (value !== undefined && value !== null && value !== "") {
      let stringVal = String(value).trim();
      const encodedVal = encodeURIComponent(stringVal).replace(/%20/g, "+");
      parts.push(`${key}=${encodedVal}`);
    }
  }

  // 4. Add passphrase at the end
  if (passphrase && String(passphrase).trim() !== "") {
    const passphraseStr = String(passphrase).trim();
    const encodedPassphrase = encodeURIComponent(passphraseStr).replace(
      /%20/g,
      "+",
    );
    parts.push(`passphrase=${encodedPassphrase}`);
  }

  const stringToHash = parts.join("&");
  const generatedSignature = createHash("md5")
    .update(stringToHash)
    .digest("hex");

  console.log("🔍 ITN Signature Validation:");
  console.log("├─ String to hash:", stringToHash);
  console.log("├─ Generated signature:", generatedSignature);
  console.log("├─ Received signature:", receivedSignature);
  console.log(
    "└─ Match:",
    generatedSignature === receivedSignature ? "✅" : "❌",
  );

  return generatedSignature === receivedSignature;
}

/**
 * Verify PayFast ITN payment
 */
export async function verifyPayFastPayment(postData, passphrase) {
  console.log("🔍 Verifying PayFast ITN payment...");

  // 1. Signature check
  const signatureValid = validatePayFastSignature(postData, passphrase);
  if (!signatureValid) {
    console.error("❌ Signature validation failed");
    return { valid: false, error: "Invalid signature" };
  }

  console.log("✅ Signature valid");

  // 2. Payment status check
  if (postData.payment_status !== "COMPLETE") {
    console.warn(`⚠️ Payment status: ${postData.payment_status}`);
    return {
      valid: false,
      error: `Payment not complete. Status: ${postData.payment_status}`,
    };
  }

  console.log("✅ Payment status: COMPLETE");

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
}

/**
 * PayFast status constants
 */
export const PAYFAST_STATUS = {
  COMPLETE: "COMPLETE",
  FAILED: "FAILED",
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
};

/**
 * Load PayFast config from environment
 */
export function getPayFastConfig(orderId = null) {
  const isSandbox = process.env.NEXT_PAYFAST_SANDBOX === "true";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not set");
  }

  const returnUrl = new URL(`${baseUrl}/payment/success`);
  const cancelUrl = new URL(`${baseUrl}/payment/cancel`);

  if (orderId) {
    returnUrl.searchParams.set("orderId", orderId);
    cancelUrl.searchParams.set("orderId", orderId);
  }

  const merchantId = isSandbox
    ? process.env.NEXT_PAYFAST_SANDBOX_MERCHANT_ID
    : process.env.NEXT_PAYFAST_MERCHANT_ID;

  const merchantKey = isSandbox
    ? process.env.NEXT_PAYFAST_SANDBOX_MERCHANT_KEY
    : process.env.NEXT_PAYFAST_MERCHANT_KEY;

  const passphrase = isSandbox
    ? process.env.NEXT_PAYFAST_SANDBOX_PASSPHRASE
    : process.env.NEXT_PAYFAST_PASSPHRASE;

  if (!merchantId || !merchantKey) {
    throw new Error("PayFast credentials not configured");
  }

  return {
    merchantId,
    merchantKey,
    passphrase: passphrase || "",
    isSandbox,
    returnUrl: returnUrl.toString(),
    cancelUrl: cancelUrl.toString(),
    notifyUrl: `${baseUrl}/api/webhooks/payfast`,
  };
}

/**
 * Create HTML form for POST submission (RECOMMENDED METHOD)
 */
export function createPayFastForm(paymentData, isSandbox = false) {
  const actionUrl = isSandbox
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";

  let formHtml = `<form id="payfast-form" method="POST" action="${actionUrl}">\n`;

  for (const key in paymentData) {
    const value = paymentData[key];
    // Skip passphrase - it should never be sent to PayFast
    if (key === "passphrase") continue;

    if (value !== null && value !== undefined && value !== "") {
      formHtml += `  <input type="hidden" name="${key}" value="${value.toString().replace(/"/g, "&quot;")}">\n`;
    }
  }

  formHtml += `  <input type="submit" value="Pay Now">\n`;
  formHtml += `</form>`;

  return formHtml;
}
