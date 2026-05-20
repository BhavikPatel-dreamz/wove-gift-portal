const DEFAULT_WHATSAPP_TEMPLATE = [
  "Hello {{recipientName}},",
  "",
  "A gift has been issued for you from {{issuerName}} via Wove Gifts.",
  "",
  "Gift amount: {{giftAmount}}",
  "Gift code: {{giftCode}}",
  "",
  "{{customMessageSection}}{{giftImageSection}}{{giftUrlSection}}{{brandWebsiteSection}}Thank you.",
].join("\n");

const TABLET_REGEX =
  /ipad|tablet|(android(?!.*mobile))|kindle|playbook|silk/i;
const MOBILE_REGEX =
  /android|iphone|ipod|blackberry|iemobile|opera mini|mobile/i;

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

function normalizeUrlForComparison(value) {
  const absoluteUrl = toAbsoluteUrl(value);

  if (!absoluteUrl) {
    return "";
  }

  return absoluteUrl.trim().replace(/\/+$/, "").toLowerCase();
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
  recipientName = "there",
  giftName = "gift",
  brandName = "",
  brandWebsite = "",
  giftImageUrl = "",
} = {}) {
  const resolvedTemplate = template || getConfiguredTemplate();
  const safeGiftUrl = toAbsoluteUrl(giftUrl);
  const safeBrandWebsite = toAbsoluteUrl(brandWebsite);
  const safeGiftImageUrl = toAbsoluteUrl(giftImageUrl);
  const safeCustomMessage = String(customMessage || "").trim();
  const safeBrandName = String(brandName || "").trim();
  const safeSenderName = String(senderName || "").trim() || "Someone";
  const issuerName = safeSenderName || safeBrandName || "Someone";
  const showWebsiteSection =
    safeBrandWebsite &&
    normalizeUrlForComparison(safeBrandWebsite) !==
      normalizeUrlForComparison(safeGiftUrl);

  return cleanupMessage(
    interpolateTemplate(resolvedTemplate, {
      giftAmount,
      giftCode,
      giftUrl: safeGiftUrl,
      senderName: safeSenderName,
      customMessage: safeCustomMessage,
      recipientName,
      giftName,
      brandName: safeBrandName,
      brandWebsite: safeBrandWebsite,
      giftImageUrl: safeGiftImageUrl,
      issuerName,
      customMessageBlock: safeCustomMessage
        ? `Message: "${safeCustomMessage}"`
        : "",
      customMessageSection: safeCustomMessage
        ? `Message:\n${safeCustomMessage}\n\n`
        : "",
      giftImageSection: safeGiftImageUrl
        ? `Occasion card:\n${safeGiftImageUrl}\n\n`
        : "",
      giftUrlSection: safeGiftUrl ? `Redeem URL:\n${safeGiftUrl}\n\n` : "",
      brandWebsiteSection: showWebsiteSection
        ? `Website:\n${safeBrandWebsite}\n\n`
        : "",
    }),
  );
}

export function generateWhatsAppMultiGiftMessage({
  gifts = [],
  senderName = "Someone",
  customMessage = "",
  recipientName = "there",
  template,
} = {}) {
  if (!Array.isArray(gifts) || gifts.length === 0) {
    return generateWhatsAppMessage({
      senderName,
      customMessage,
      recipientName,
    });
  }

  if (gifts.length === 1) {
    return generateWhatsAppMessage({
      ...gifts[0],
      senderName: gifts[0].senderName || senderName,
      customMessage: gifts[0].customMessage || customMessage,
      recipientName: gifts[0].recipientName || recipientName,
    });
  }

  const intro = `Hi ${recipientName},\n\n${senderName} sent you ${gifts.length} gift${
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
      recipientName: gift.recipientName || recipientName,
      template,
    });

    return `${index + 1}. ${itemMessage}`;
  });

  return cleanupMessage(`${intro}${messageBlock}\n\n${lines.join("\n\n")}`);
}

export function getWhatsAppShareUrl(message, deviceType = detectDeviceType()) {
  const encodedMessage = encodeURIComponent(message);
  const isMobileLike = deviceType === "mobile" || deviceType === "tablet";

  return isMobileLike
    ? `whatsapp://send?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;
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
  onOpened,
  onBlocked,
  onFallback,
  fallbackDelay = 1400,
} = {}) {
  if (typeof window === "undefined") {
    throw new Error("WhatsApp sharing is only available in the browser.");
  }

  const deviceType = detectDeviceType();
  const shareUrl = getWhatsAppShareUrl(message, deviceType);

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
