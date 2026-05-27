export const FALLBACK_IMAGE_URL =
  "https://res.cloudinary.com/doofigvtb/image/upload/c_pad,b_auto,h_630,w_1200,q_auto,f_jpg/v1779362828/occasion-occasion_categories/u6cutgt8fkfqwoneozpa.webp";
export const PREVIEW_TITLE = "Gift card preview";
export const PREVIEW_DESCRIPTION = "Open gift card preview";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export function decodeBase64Url(value) {
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

export function parsePreviewPayload(searchParams) {
  const encodedImageUrl = searchParams.get("i");

  if (encodedImageUrl) {
    return {
      imageUrl: decodeBase64Url(encodedImageUrl),
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
    imageUrl: searchParams.get("image") || "",
  };
}

export function getHeaderValue(headers, name) {
  const value = headers?.get?.(name);

  if (!value) {
    return "";
  }

  return value.split(",")[0].trim();
}

export function getPublicOrigin(request) {
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

export function getPublicPageUrl(request, publicOrigin) {
  try {
    return new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      publicOrigin,
    ).toString();
  } catch {
    return request.nextUrl.toString();
  }
}

export function toAbsoluteUrl(value, baseUrl) {
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

export function toWhatsAppSizedImageUrl(imageUrl) {
  try {
    const url = new URL(imageUrl);
    const cloudinaryUploadPath = "/image/upload/";
    const uploadIndex = url.pathname.indexOf(cloudinaryUploadPath);

    if (url.hostname === "res.cloudinary.com" && uploadIndex !== -1) {
      const prefix = url.pathname.slice(
        0,
        uploadIndex + cloudinaryUploadPath.length,
      );
      const suffix = url.pathname.slice(
        uploadIndex + cloudinaryUploadPath.length,
      );

      if (suffix.startsWith("c_pad,")) {
        return url.toString();
      }

      const sourcePath =
        suffix.includes("/") && /^(c_|w_|h_|q_|f_|g_|b_)/.test(suffix)
          ? suffix.slice(suffix.indexOf("/") + 1)
          : suffix;

      url.pathname = `${prefix}c_pad,b_auto,h_${OG_IMAGE_HEIGHT},w_${OG_IMAGE_WIDTH},q_auto,f_jpg/${sourcePath}`;
      return url.toString();
    }

    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("w", String(OG_IMAGE_WIDTH));
      url.searchParams.set("h", String(OG_IMAGE_HEIGHT));
      url.searchParams.set("fit", "crop");
      url.searchParams.set("q", "80");
      url.searchParams.set("fm", "jpg");
      return url.toString();
    }

    return url.toString();
  } catch {
    return imageUrl;
  }
}

export function getPreviewImageSourceUrl(request, publicOrigin) {
  const payload = parsePreviewPayload(request.nextUrl.searchParams);
  const rawImageUrl =
    toAbsoluteUrl(payload.imageUrl || payload.image, publicOrigin) ||
    FALLBACK_IMAGE_URL;

  return toWhatsAppSizedImageUrl(rawImageUrl);
}

export function getPreviewImageProxyUrl(request, publicOrigin) {
  const imageUrl = new URL("/whatsapp-gift-preview/image", publicOrigin);
  const encodedImageUrl = request.nextUrl.searchParams.get("i");
  const encodedPayload = request.nextUrl.searchParams.get("p");
  const version = request.nextUrl.searchParams.get("v");

  if (encodedImageUrl) {
    imageUrl.searchParams.set("i", encodedImageUrl);
  } else if (encodedPayload) {
    imageUrl.searchParams.set("p", encodedPayload);
  }

  if (version) {
    imageUrl.searchParams.set("v", version);
  }

  return imageUrl.toString();
}

export function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
