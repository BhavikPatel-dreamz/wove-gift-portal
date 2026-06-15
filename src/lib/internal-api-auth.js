import { timingSafeEqual } from "crypto";

const INTERNAL_AUTH_HEADER = "x-internal-api-secret";

function getInternalSecret() {
  return (
    process.env.INTERNAL_API_SECRET ||
    process.env.CRON_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    ""
  );
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function getInternalAuthHeaders(extraHeaders = {}) {
  const secret = getInternalSecret();

  return {
    ...extraHeaders,
    ...(secret ? { [INTERNAL_AUTH_HEADER]: secret } : {}),
  };
}

export function isValidInternalRequest(request) {
  const secret = getInternalSecret();

  if (!secret) {
    return false;
  }

  return safeEqual(request.headers.get(INTERNAL_AUTH_HEADER), secret);
}
