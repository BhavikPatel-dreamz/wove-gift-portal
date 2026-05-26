const DEFAULT_WHATSAPP_TEMPLATE = [
  "{{sharePreviewHeaderSection}}{{messageBodySection}}Brand: {{giftDisplayName}}",
  "",
  "Gift Card Code: {{giftCode}}",
  "",
  "Use your gift card code here:",
  "{{giftUrl}}",
  "",
  "Powered by WoveGifts",
  "www.wovegifts.com",
].join("\n");

const TABLET_REGEX =
  /ipad|tablet|(android(?!.*mobile))|kindle|playbook|silk/i;
const MOBILE_REGEX =
  /android|iphone|ipod|blackberry|iemobile|opera mini|mobile/i;
const WHATSAPP_PREVIEW_PAGE_PATH = "/whatsapp-gift-preview";
const WHATSAPP_PREVIEW_URL_VERSION = "4";
const MAX_PREVIEW_IMAGE_URL_LENGTH = 900;
const MAX_PREVIEW_TITLE_LENGTH = 90;
const MAX_PREVIEW_DESCRIPTION_LENGTH = 180;

function getConfiguredTemplate() {
  const configuredTemplate = process.env.NEXT_PUBLIC_WHATSAPP_SHARE_TEMPLATE;
  return typeof configuredTemplate === "string" && configuredTemplate.trim()
    ? configuredTemplate
    : DEFAULT_WHATSAPP_TEMPLATE;
}

function toAbsoluteUrl(value) {
  if (!value) return "";
  const trimmedValue = String(value).trim();

  if (!trimmedValue) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmedValue)) {
    return `https://${trimmedValue}`;
  }

  if (typeof window === "undefined") {
    return trimmedValue;
  }

  try {
    return new URL(trimmedValue, window.location.origin).toString();
  } catch {
    return trimmedValue;
  }
}

function getSharePreviewBaseUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "";

  if (configuredBaseUrl) {
    try {
      return new URL(configuredBaseUrl).origin;
    } catch {
      // Fall back to the browser origin below when the configured URL is invalid.
    }
  }

  return "";
}

function truncatePreviewValue(value, maxLength) {
  const text = String(value || "").trim();

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength);
}

function encodeBase64Url(value) {
  const text = String(value || "");
  const BufferConstructor = globalThis.Buffer;

  if (typeof BufferConstructor !== "undefined") {
    return BufferConstructor.from(text, "utf8").toString("base64url");
  }

  if (
    typeof globalThis.TextEncoder !== "undefined" &&
    typeof globalThis.btoa !== "undefined"
  ) {
    const bytes = new globalThis.TextEncoder().encode(text);
    let binary = "";

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return globalThis.btoa(binary)
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replace(/=+$/g, "");
  }

  return encodeURIComponent(text);
}

export function buildWhatsAppPreviewPageUrl({
  imageUrl = "",
  title = "Wove Gift Card",
  description = "A beautifully presented Wove gift card, ready to preview and share on WhatsApp.",
} = {}) {
  const baseUrl = getSharePreviewBaseUrl();
  const payload = {
    imageUrl: truncatePreviewValue(imageUrl, MAX_PREVIEW_IMAGE_URL_LENGTH),
    title: truncatePreviewValue(title, MAX_PREVIEW_TITLE_LENGTH),
    description: truncatePreviewValue(
      description,
      MAX_PREVIEW_DESCRIPTION_LENGTH,
    ),
  };

  if (!baseUrl) {
    const encodedPayload = encodeBase64Url(JSON.stringify(payload));
    return `${WHATSAPP_PREVIEW_PAGE_PATH}?p=${encodedPayload}&v=${WHATSAPP_PREVIEW_URL_VERSION}`;
  }

  const previewUrl = new URL(WHATSAPP_PREVIEW_PAGE_PATH, baseUrl);
  previewUrl.searchParams.set("p", encodeBase64Url(JSON.stringify(payload)));
  previewUrl.searchParams.set("v", WHATSAPP_PREVIEW_URL_VERSION);

  return previewUrl.toString();
}

function interpolateTemplate(template, variables) {
  return Object.entries(variables).reduce((message, [key, value]) => {
    const safeValue = String(value ?? "");
    return message.replaceAll(`{{${key}}}`, safeValue);
  }, template);
}

function cleanupMessage(message) {
  return String(message || "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function removeRecipientGreeting(template) {
  return String(template || "")
    .replace(/^Hi\s*\{\{\s*recipientName\s*\}\},?\s*\n*/i, "")
    .replace(/^Hello\s*\{\{\s*recipientName\s*\}\},?\s*\n*/i, "")
    .replaceAll("{{recipientName}}", "");
}

export function detectDeviceType(userAgent) {
  const source =
    typeof userAgent === "string"
      ? userAgent
      : typeof navigator !== "undefined"
        ? navigator.userAgent
        : "";

  const isTablet =
    TABLET_REGEX.test(source) ||
    (/macintosh/i.test(source) &&
      typeof navigator !== "undefined" &&
      navigator.maxTouchPoints > 1);

  if (isTablet) return "tablet";
  if (MOBILE_REGEX.test(source)) return "mobile";
  return "desktop";
}

export function buildGiftCardShareImageUrls(giftCode = "") {
  const normalizedCode = String(giftCode || "").trim();

  if (!normalizedCode) {
    return {
      imageUrl: "",
      imageViewUrl: "",
    };
  }

  const encodedCode = encodeURIComponent(normalizedCode);

  return {
    imageUrl: `/gift-voucher/${encodedCode}/image`,
    imageViewUrl: `/gift-voucher/${encodedCode}/image-view`,
  };
}

export function generateWhatsAppMessage({
  template,
  giftAmount = "",
  giftCode = "",
  giftUrl = "",
  senderName = "Someone",
  customMessage = "",
  giftName = "gift",
  brandName = "",
  brandWebsite = "",
  giftImageUrl = "",
  sharePreviewUrl = "",
} = {}) {
  const resolvedTemplate = removeRecipientGreeting(
    template || getConfiguredTemplate(),
  );
  const safeGiftUrl = toAbsoluteUrl(giftUrl);
  const safeGiftImageUrl = toAbsoluteUrl(giftImageUrl);
  const safeSharePreviewUrl = toAbsoluteUrl(sharePreviewUrl);
  const safeCustomMessage = String(customMessage || "").trim();
  const safeBrandName = String(brandName || "").trim();
  const safeGiftName = String(giftName || "").trim();
  const safeGiftAmount = String(giftAmount || "").trim();
  const safeSenderName = String(senderName || "").trim() || "Someone";
  const safeBrandWebsite = toAbsoluteUrl(brandWebsite);
  const normalizedBrandName = safeBrandName.toLowerCase();
  const normalizedGiftName = safeGiftName.toLowerCase();
  const giftDisplayName = safeBrandName && safeGiftAmount
    ? `${safeBrandName} ${safeGiftAmount} Voucher`
    : safeGiftName && safeGiftAmount
      ? `${safeGiftName} ${safeGiftAmount}`
      : safeGiftName && safeBrandName && normalizedGiftName !== normalizedBrandName
        ? `${safeBrandName} ${safeGiftName}`
        : safeGiftName || safeBrandName || "Gift Voucher";
  const fallbackMessage = `${safeSenderName} sent you a gift from WoveGifts.`;
  const previewDescription = safeCustomMessage || fallbackMessage;
  const computedSharePreviewUrl =
    safeSharePreviewUrl ||
    buildWhatsAppPreviewPageUrl({
      imageUrl: safeGiftImageUrl,
      title: giftDisplayName,
      description: previewDescription,
    });

  return cleanupMessage(
    interpolateTemplate(resolvedTemplate, {
      giftAmount,
      giftCode,
      giftUrl: safeGiftUrl,
      senderName: safeSenderName,
      customMessage: safeCustomMessage,
      recipientName: "",
      giftName,
      brandName: safeBrandName,
      brandWebsite: safeBrandWebsite,
      giftImageUrl: safeGiftImageUrl,
      sharePreviewUrl: computedSharePreviewUrl,
      giftDisplayName,
      customMessageBlock: safeCustomMessage
        ? `Message: "${safeCustomMessage}"`
        : "",
      customMessageSection: safeCustomMessage
        ? `Message:\n${safeCustomMessage}\n\n`
        : "",
      messageBodySection: safeCustomMessage
        ? `${safeCustomMessage}\n\n`
        : `${fallbackMessage}\n\n`,
      giftImageHeaderSection: computedSharePreviewUrl
        ? `${computedSharePreviewUrl}\n\n`
        : "",
      sharePreviewHeaderSection: computedSharePreviewUrl
        ? `${computedSharePreviewUrl}\n\n`
        : "",
      giftImageSection: safeGiftImageUrl
        ? `Occasion card:\n${safeGiftImageUrl}\n\n`
        : "",
      giftUrlSection: safeGiftUrl ? `Redeem URL:\n${safeGiftUrl}\n\n` : "",
      brandWebsiteSection: "",
    }),
  );
}

export function generateWhatsAppMultiGiftMessage({
  gifts = [],
  senderName = "Someone",
  customMessage = "",
  template,
} = {}) {
  if (!Array.isArray(gifts) || gifts.length === 0) {
    return generateWhatsAppMessage({
      senderName,
      customMessage,
    });
  }

  if (gifts.length === 1) {
    return generateWhatsAppMessage({
      ...gifts[0],
      senderName: gifts[0].senderName || senderName,
      customMessage: gifts[0].customMessage || customMessage,
      recipientName: "",
    });
  }

  const intro = `${senderName} sent you ${gifts.length} gift${
    gifts.length > 1 ? "s" : ""
  }.`;

  const messageBlock = customMessage
    ? `\n\nMessage: "${String(customMessage).trim()}"`
    : "";

  const lines = gifts.map((gift, index) => {
    const itemMessage = generateWhatsAppMessage({
      ...gift,
      senderName: gift.senderName || senderName,
      customMessage: "",
      recipientName: "",
      template,
    });

    return `${index + 1}. ${itemMessage}`;
  });

  return cleanupMessage(`${intro}${messageBlock}\n\n${lines.join("\n\n")}`);
}

function normalizeWhatsAppPhoneNumber(phoneNumber = "") {
  return String(phoneNumber || "").replace(/\D/g, "");
}

export function getWhatsAppShareUrl(
  message,
  deviceType = detectDeviceType(),
  phoneNumber = "",
) {
  const encodedMessage = encodeURIComponent(message);
  const isMobileLike = deviceType === "mobile" || deviceType === "tablet";
  const normalizedPhoneNumber = normalizeWhatsAppPhoneNumber(phoneNumber);
  const phonePath = normalizedPhoneNumber ? `/${normalizedPhoneNumber}` : "";
  const phoneQuery = normalizedPhoneNumber
    ? `phone=${encodeURIComponent(normalizedPhoneNumber)}&`
    : "";

  return isMobileLike
    ? `whatsapp://send?${phoneQuery}text=${encodedMessage}`
    : `https://wa.me${phonePath}?text=${encodedMessage}`;
}

export async function copyMessageFallback(message) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(message);
    return true;
  }

  if (typeof document === "undefined") {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = message;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    document.body.removeChild(textarea);
  }

  return copied;
}

export function openWhatsAppShare({
  message,
  phoneNumber = "",
  onOpened,
  onBlocked,
  onFallback,
  fallbackDelay = 1400,
} = {}) {
  if (typeof window === "undefined") {
    throw new Error("WhatsApp sharing is only available in the browser.");
  }

  const deviceType = detectDeviceType();
  const shareUrl = getWhatsAppShareUrl(message, deviceType, phoneNumber);

  if (deviceType === "desktop") {
    const popup = window.open(shareUrl, "_blank", "noopener,noreferrer");

    if (!popup) {
      onBlocked?.({ deviceType, url: shareUrl, method: "web" });
      return { opened: false, blocked: true, deviceType, method: "web" };
    }

    onOpened?.({ deviceType, url: shareUrl, method: "web" });
    return { opened: true, deviceType, method: "web" };
  }

  let opened = false;
  let timerId = null;

  const cleanup = () => {
    if (timerId) {
      window.clearTimeout(timerId);
      timerId = null;
    }
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pagehide", handlePageHide);
  };

  const handleOpen = (method) => {
    if (opened) return;
    opened = true;
    cleanup();
    onOpened?.({ deviceType, url: shareUrl, method });
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      handleOpen("app");
    }
  };

  const handlePageHide = () => {
    handleOpen("app");
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", handlePageHide, { once: true });

  timerId = window.setTimeout(() => {
    cleanup();
    if (!opened) {
      onFallback?.({ deviceType, url: shareUrl, method: "clipboard" });
    }
  }, fallbackDelay);

  window.location.href = shareUrl;

  return { opened: true, pending: true, deviceType, method: "app" };
}
