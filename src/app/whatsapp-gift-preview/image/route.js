import {
  FALLBACK_IMAGE_URL,
  getPreviewImageSourceUrl,
  getPublicOrigin,
} from "../utils.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const IMAGE_FETCH_TIMEOUT_MS = 7000;
const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\./,
  /^\[?::1\]?$/i,
  /\.local$/i,
];

function isSafeImageUrl(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      !PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname))
    );
  } catch {
    return false;
  }
}

async function fetchImageBuffer(imageUrl) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, IMAGE_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(imageUrl, {
      headers: {
        Accept: "image/jpeg,image/png,image/webp,image/*,*/*;q=0.8",
        "User-Agent": "WoveGiftPreviewBot/1.0",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Image fetch failed: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";

    if (!contentType.toLowerCase().startsWith("image/")) {
      throw new Error(`Unsupported image content type: ${contentType}`);
    }

    return {
      buffer: await response.arrayBuffer(),
      contentType,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET(request) {
  const publicOrigin = getPublicOrigin(request);
  const primaryImageUrl = getPreviewImageSourceUrl(request, publicOrigin);
  const imageUrl = isSafeImageUrl(primaryImageUrl)
    ? primaryImageUrl
    : FALLBACK_IMAGE_URL;

  let image;

  try {
    image = await fetchImageBuffer(imageUrl);
  } catch {
    image = await fetchImageBuffer(FALLBACK_IMAGE_URL);
  }

  return new Response(image.buffer, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
      "Content-Length": String(image.buffer.byteLength),
      "Content-Type": image.contentType,
    },
  });
}
