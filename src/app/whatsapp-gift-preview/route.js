import { prisma } from "@/lib/db";
import {
  WHATSAPP_PREVIEW_IMAGE_HEIGHT,
  WHATSAPP_PREVIEW_IMAGE_WIDTH,
  toWhatsAppLandscapeImageUrl,
} from "@/lib/whatsappShare";

const FALLBACK_IMAGE_URL =
  "https://res.cloudinary.com/doofigvtb/image/upload/c_pad,b_auto,h_630,w_1200,q_auto,f_jpg/v1779362828/occasion-occasion_categories/u6cutgt8fkfqwoneozpa.webp";
const PREVIEW_TITLE = "Gift card preview";
const PREVIEW_DESCRIPTION = "Open gift card preview";
const PREVIEW_SITE_NAME = "WoveGifts";
const PREVIEW_IMAGE_ALT = "Gift card preview";
const OG_IMAGE_WIDTH = WHATSAPP_PREVIEW_IMAGE_WIDTH;
const OG_IMAGE_HEIGHT = WHATSAPP_PREVIEW_IMAGE_HEIGHT;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
  const code = searchParams.get("c");

  if (code) {
    return {
      code,
      title: searchParams.get("title") || "",
      description: searchParams.get("description") || "",
    };
  }

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
    code: "",
    imageUrl: searchParams.get("image") || "",
    title: searchParams.get("title") || "",
    description: searchParams.get("description") || "",
  };
}

function normalizePreviewCode(rawCode) {
  const code = String(rawCode || "").trim();

  if (!code) {
    return "";
  }

  try {
    return decodeURIComponent(code).trim();
  } catch {
    return code;
  }
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

async function findPreviewDataByCode(code) {
  const voucherCode = await prisma.voucherCode.findFirst({
    where: { code: { equals: code, mode: "insensitive" } },
    select: {
      tokenizedLink: true,
      originalValue: true,
      order: {
        select: {
          amount: true,
          currency: true,
          isCustom: true,
          customImageUrl: true,
          customCardId: true,
          subCategoryId: true,
          brand: { select: { brandName: true } },
          occasion: { select: { image: true } },
        },
      },
    },
  });

  if (voucherCode) {
    return {
      tokenizedLink: voucherCode.tokenizedLink || "",
      amount: voucherCode.originalValue || voucherCode.order?.amount || "",
      currency: voucherCode.order?.currency || "",
      brandName: voucherCode.order?.brand?.brandName || "",
      order: voucherCode.order,
    };
  }

  const giftCard = await prisma.giftCard.findFirst({
    where: { code: { equals: code, mode: "insensitive" } },
    select: {
      voucherCode: {
        select: {
          tokenizedLink: true,
          originalValue: true,
          order: {
            select: {
              amount: true,
              currency: true,
              isCustom: true,
              customImageUrl: true,
              customCardId: true,
              subCategoryId: true,
              brand: { select: { brandName: true } },
              occasion: { select: { image: true } },
            },
          },
        },
      },
    },
  });

  const resolvedVoucherCode = giftCard?.voucherCode;

  return resolvedVoucherCode
    ? {
        tokenizedLink: resolvedVoucherCode.tokenizedLink || "",
        amount:
          resolvedVoucherCode.originalValue ||
          resolvedVoucherCode.order?.amount ||
          "",
        currency: resolvedVoucherCode.order?.currency || "",
        brandName: resolvedVoucherCode.order?.brand?.brandName || "",
        order: resolvedVoucherCode.order,
      }
    : null;
}

async function resolveOrderImage(order) {
  const customImageUrl = order?.customImageUrl?.trim();
  if (customImageUrl) return customImageUrl;

  if (order?.isCustom && order?.customCardId) {
    const customCard = await prisma.customCard.findUnique({
      where: { id: order.customCardId },
      select: { image: true },
    });

    if (customCard?.image) return customCard.image;
  }

  if (!order?.isCustom && order?.subCategoryId) {
    const category = await prisma.occasionCategory.findUnique({
      where: { id: order.subCategoryId },
      select: { image: true },
    });

    if (category?.image) return category.image;
  }

  return order?.occasion?.image || "";
}

async function resolvePreviewDataByCode(code, baseUrl) {
  if (!code) {
    return {
      amount: "",
      brandName: "",
      imageUrl: "",
      redeemUrl: "",
    };
  }

  try {
    const previewData = await findPreviewDataByCode(code);
    const imagePath = await resolveOrderImage(previewData?.order);

    return {
      amount: previewData?.amount || "",
      brandName: previewData?.brandName || "",
      currency: previewData?.currency || "",
      imageUrl: toAbsoluteUrl(imagePath, baseUrl),
      redeemUrl: toAbsoluteUrl(previewData?.tokenizedLink, baseUrl),
    };
  } catch (error) {
    console.error("[whatsapp-gift-preview] Failed to resolve preview data", {
      code,
      message: error?.message,
    });

    return {
      amount: "",
      brandName: "",
      currency: "",
      imageUrl: "",
      redeemUrl: "",
    };
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

export async function GET(request) {
  const baseUrl = getPublicOrigin(request);
  const payload = parsePreviewPayload(request.nextUrl.searchParams);
  const previewCode = normalizePreviewCode(payload.code);
  const resolvedPreviewData = await resolvePreviewDataByCode(
    previewCode,
    baseUrl,
  );
  const rawImageUrl =
    toAbsoluteUrl(
      previewCode
        ? resolvedPreviewData.imageUrl ||
            `/gift-voucher/${encodeURIComponent(previewCode)}/image`
        : payload.imageUrl || payload.image,
      baseUrl,
    ) ||
    FALLBACK_IMAGE_URL;
  const imageUrl = toWhatsAppLandscapeImageUrl(rawImageUrl);
  const pageUrl = getPublicPageUrl(request, baseUrl);
  const giftLabel = [
    resolvedPreviewData.brandName || "Gift Card",
    resolvedPreviewData.amount
      ? `${resolvedPreviewData.currency || ""} ${resolvedPreviewData.amount}`.trim()
      : "",
  ]
    .filter(Boolean)
    .join(" - ");
  const safeTitle = escapeHtml(payload.title || giftLabel || PREVIEW_TITLE);
  const safeDescription = escapeHtml(
    payload.description ||
      (previewCode
        ? `Your gift card is ready. Code: ${previewCode}`
        : PREVIEW_DESCRIPTION),
  );
  const safeSiteName = escapeHtml(PREVIEW_SITE_NAME);
  const safeImageAlt = escapeHtml(PREVIEW_IMAGE_ALT);
  const safeImageUrl = escapeHtml(imageUrl);
  const safePageUrl = escapeHtml(pageUrl);
  const safeRedeemUrl = escapeHtml(resolvedPreviewData.redeemUrl || "");
  const safePreviewCode = escapeHtml(previewCode);
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: giftLabel || "Gift Card",
    description: previewCode
      ? `Gift card code: ${previewCode}`
      : "Gift card preview",
    image: imageUrl,
    offers: {
      "@type": "Offer",
      price: String(resolvedPreviewData.amount || 0),
      priceCurrency: resolvedPreviewData.currency || "ZAR",
    },
  }).replaceAll("<", "\\u003c");

  const html = `<!doctype html>
<html lang="en">
  <head>
	    <meta charset="utf-8">
	    <meta name="viewport" content="width=device-width, initial-scale=1">
	    <title>${safeTitle}</title>
	    <meta name="description" content="${safeDescription}">
	    <meta name="robots" content="index,follow">
	    <link rel="canonical" href="${safePageUrl}">
	    <meta property="og:type" content="website">
	    <meta property="og:site_name" content="${safeSiteName}">
	    <meta property="og:locale" content="en_US">
	    <meta property="og:title" content="${safeTitle}">
	    <meta property="og:description" content="${safeDescription}">
	    <meta property="og:url" content="${safePageUrl}">
	    <meta property="og:image" content="${safeImageUrl}">
	    <meta property="og:image:secure_url" content="${safeImageUrl}">
	    <meta property="og:image:type" content="image/jpeg">
	    <meta property="og:image:width" content="${OG_IMAGE_WIDTH}">
	    <meta property="og:image:height" content="${OG_IMAGE_HEIGHT}">
	    <meta property="og:image:alt" content="${safeImageAlt}">
	    <meta name="twitter:card" content="summary_large_image">
	    <meta name="twitter:title" content="${safeTitle}">
	    <meta name="twitter:description" content="${safeDescription}">
	    <meta name="twitter:image" content="${safeImageUrl}">
	    <meta name="twitter:image:alt" content="${safeImageAlt}">
	    <meta name="theme-color" content="#f8f1eb">
	    <style>
	      * { box-sizing: border-box; }
	      html,
	      body {
	        margin: 0;
	        padding: 0;
	        min-height: 100%;
	        background: #f5f5f5;
	        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
	      }
	      main {
	        min-height: 100vh;
	        display: flex;
	        align-items: center;
	        justify-content: center;
	        padding: 20px;
	      }
	      .container {
	        width: 100%;
	        max-width: 600px;
	        border-radius: 12px;
	        padding: 24px;
	        text-align: center;
	        background: #ffffff;
	        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	      }
	      h1 { margin: 0 0 8px; font-size: 28px; color: #111827; }
	      p { margin: 8px 0; color: #666666; }
	      img {
	        display: block;
	        width: 100%;
	        height: auto;
	        max-height: 315px;
	        object-fit: contain;
	        border-radius: 8px;
	        margin: 16px 0;
	        background: #f8f8f8;
	      }
	      .code {
	        display: inline-block;
	        margin: 16px 0;
	        padding: 12px 24px;
	        border-radius: 6px;
	        background: #f0f0f0;
	        color: #111827;
	        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	        font-size: 20px;
	        font-weight: 700;
	        word-break: break-all;
	      }
	      .button {
	        display: inline-flex;
	        align-items: center;
	        justify-content: center;
	        min-height: 44px;
	        margin-top: 16px;
	        padding: 0 32px;
	        border-radius: 8px;
	        background: #25d366;
	        color: #ffffff;
	        font-size: 16px;
	        font-weight: 600;
	        text-decoration: none;
	      }
	      .button:hover { background: #128c7e; }
    </style>
    <script type="application/ld+json">${structuredData}</script>
  </head>
	  <body>
	    <main>
        <div class="container">
          <h1>Your Gift Card</h1>
          <p>${safeTitle}</p>
          <img src="${safeImageUrl}" alt="${safeImageAlt}" width="600" height="315">
          ${safePreviewCode ? `<div class="code">${safePreviewCode}</div>` : ""}
          ${
            safeRedeemUrl
              ? `<br><a href="${safeRedeemUrl}" class="button" rel="noopener noreferrer">Open Gift Card</a>`
              : ""
          }
        </div>
	    </main>
	  </body>
</html>`;

  return new Response(html, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
