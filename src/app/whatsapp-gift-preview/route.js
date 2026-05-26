const FALLBACK_IMAGE_URL =
  "https://res.cloudinary.com/doofigvtb/image/upload/c_pad,b_auto,h_630,w_1200,q_auto,f_jpg/v1779362828/occasion-occasion_categories/u6cutgt8fkfqwoneozpa.webp";
const PREVIEW_TITLE = "Gift card preview";
const PREVIEW_DESCRIPTION = "Open gift card preview";
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

export const dynamic = "force-dynamic";

function decodeBase64Url(value) {
  const text = String(value || "").trim();

  if (!text) {
    return "";
  }

  try {
    const normalized = text.replaceAll("-", "+").replaceAll("_", "/");
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
    return globalThis.Buffer.from(`${normalized}${padding}`, "base64").toString(
      "utf8",
    );
  } catch {
    try {
      return decodeURIComponent(text);
    } catch {
      return "";
    }
  }
}

function parsePreviewPayload(searchParams) {
  const encodedPayload = searchParams.get("p");

  if (encodedPayload) {
    try {
      const payload = JSON.parse(decodeBase64Url(encodedPayload));

      if (payload && typeof payload === "object") {
        return payload;
      }
    } catch {
      return {};
    }
  }

  return {
    imageUrl: searchParams.get("image") || "",
    title: searchParams.get("title") || "",
    description: searchParams.get("description") || "",
  };
}

function getHeaderValue(headers, name) {
  const value = headers?.get?.(name);

  if (!value) {
    return "";
  }

  return value.split(",")[0].trim();
}

function getPublicOrigin(request) {
  const forwardedHost = getHeaderValue(request.headers, "x-forwarded-host");
  const host = forwardedHost || getHeaderValue(request.headers, "host");
  const forwardedProto = getHeaderValue(request.headers, "x-forwarded-proto");

  if (host && host !== "localhost:3000") {
    return `${forwardedProto || "https"}://${host}`;
  }

  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "";

  if (configuredBaseUrl) {
    try {
      return new URL(configuredBaseUrl).origin;
    } catch {
      return request.nextUrl.origin;
    }
  }

  return request.nextUrl.origin;
}

function getPublicPageUrl(request, publicOrigin) {
  try {
    return new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      publicOrigin,
    ).toString();
  } catch {
    return request.nextUrl.toString();
  }
}

function toAbsoluteUrl(value, baseUrl) {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  if (trimmedValue.startsWith("//")) {
    return `https:${trimmedValue}`;
  }

  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmedValue)) {
    return `https://${trimmedValue}`;
  }

  try {
    return new URL(trimmedValue, baseUrl).toString();
  } catch {
    return "";
  }
}

function toWhatsAppSizedImageUrl(imageUrl) {
  try {
    const url = new URL(imageUrl);
    const cloudinaryUploadPath = "/image/upload/";
    const uploadIndex = url.pathname.indexOf(cloudinaryUploadPath);

    if (url.hostname !== "res.cloudinary.com" || uploadIndex === -1) {
      return url.toString();
    }

    const prefix = url.pathname.slice(0, uploadIndex + cloudinaryUploadPath.length);
    const suffix = url.pathname.slice(uploadIndex + cloudinaryUploadPath.length);

    if (suffix.startsWith("c_pad,")) {
      return url.toString();
    }

    const sourcePath =
      suffix.startsWith("c_fill,") && suffix.includes("/")
        ? suffix.slice(suffix.indexOf("/") + 1)
        : suffix;

    url.pathname = `${prefix}c_pad,b_auto,h_${OG_IMAGE_HEIGHT},w_${OG_IMAGE_WIDTH},q_auto,f_jpg/${sourcePath}`;
    return url.toString();
  } catch {
    return imageUrl;
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function GET(request) {
  const baseUrl = getPublicOrigin(request);
  const payload = parsePreviewPayload(request.nextUrl.searchParams);
  const rawImageUrl =
    toAbsoluteUrl(payload.imageUrl || payload.image, baseUrl) ||
    FALLBACK_IMAGE_URL;
  const imageUrl = toWhatsAppSizedImageUrl(rawImageUrl);
  const pageUrl = getPublicPageUrl(request, baseUrl);
  const safeTitle = escapeHtml(PREVIEW_TITLE);
  const safeDescription = escapeHtml(PREVIEW_DESCRIPTION);
  const safeImageUrl = escapeHtml(imageUrl);
  const safePageUrl = escapeHtml(pageUrl);

  const html = `<!doctype html>
<html lang="en">
  <head>
	    <meta charset="utf-8">
	    <meta name="viewport" content="width=device-width, initial-scale=1">
	    <title>${safeTitle}</title>
	    <meta name="description" content="${safeDescription}">
	    <link rel="canonical" href="${safePageUrl}">
	    <meta property="og:type" content="website">
	    <meta property="og:title" content="${safeTitle}">
	    <meta property="og:description" content="${safeDescription}">
	    <meta property="og:url" content="${safePageUrl}">
	    <meta property="og:image" content="${safeImageUrl}">
	    <meta property="og:image:secure_url" content="${safeImageUrl}">
	    <meta property="og:image:type" content="image/jpeg">
	    <meta property="og:image:width" content="${OG_IMAGE_WIDTH}">
	    <meta property="og:image:height" content="${OG_IMAGE_HEIGHT}">
	    <meta property="og:image:alt" content="Gift card preview">
	    <meta name="twitter:card" content="summary_large_image">
	    <meta name="twitter:title" content="${safeTitle}">
	    <meta name="twitter:description" content="${safeDescription}">
	    <meta name="twitter:image" content="${safeImageUrl}">
	    <meta name="theme-color" content="#f8f1eb">
	    <style>
	      * { box-sizing: border-box; }
	      html,
	      body {
	        margin: 0;
	        min-height: 100%;
	        background: #ffffff;
	      }
	      main {
	        min-height: 100vh;
	        display: grid;
	        place-items: center;
	        background: #ffffff;
	      }
	      img {
	        display: block;
	        width: min(100vw, ${OG_IMAGE_WIDTH}px);
	        height: auto;
	        max-height: 100vh;
	        object-fit: contain;
	        background: #ffffff;
	      }
    </style>
  </head>
	  <body>
	    <main>
	      <img src="${safeImageUrl}" alt="Gift card preview">
	    </main>
	  </body>
</html>`;

  return new Response(html, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
