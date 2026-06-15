import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const STATE_TTL_MS = 10 * 60 * 1000;

function getShopifySecret() {
  return process.env.SHOPIFY_SECRET_KEY || process.env.SHOPIFY_API_SECRET || "";
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function hmac(value, encoding = "hex") {
  const secret = getShopifySecret();

  if (!secret) {
    throw new Error("Missing Shopify API secret");
  }

  return createHmac("sha256", secret).update(value).digest(encoding);
}

export function createOAuthState(payload = {}) {
  const encodedPayload = Buffer.from(
    JSON.stringify({
      ...payload,
      nonce: randomBytes(16).toString("hex"),
      iat: Date.now(),
    }),
    "utf8",
  ).toString("base64url");

  return `${encodedPayload}.${hmac(encodedPayload, "base64url")}`;
}

export function verifyOAuthState(state) {
  if (!state || !state.includes(".")) {
    return { valid: false, reason: "missing_or_unsigned_state", payload: null };
  }

  const [encodedPayload, signature] = state.split(".");
  const expectedSignature = hmac(encodedPayload, "base64url");

  if (!safeEqual(signature, expectedSignature)) {
    return { valid: false, reason: "invalid_state_signature", payload: null };
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
    const issuedAt = Number(payload.iat || 0);

    if (!issuedAt || Date.now() - issuedAt > STATE_TTL_MS) {
      return { valid: false, reason: "expired_state", payload: null };
    }

    return { valid: true, reason: null, payload };
  } catch {
    return { valid: false, reason: "invalid_state_payload", payload: null };
  }
}

export function verifyShopifyOAuthHmac(searchParams) {
  const providedHmac = searchParams.get("hmac");

  if (!providedHmac) {
    return false;
  }

  const messageParts = [];

  searchParams.forEach((value, key) => {
    if (key !== "hmac" && key !== "signature") {
      messageParts.push([key, value]);
    }
  });

  const message = messageParts
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return safeEqual(providedHmac, hmac(message));
}
