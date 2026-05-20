const ANALYTICS_ENDPOINT = "/api/analytics";

function sendAnalyticsPayload(payload) {
  if (typeof window === "undefined") return;

  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
    return;
  }

  fetch(ANALYTICS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function trackWhatsAppShareEvent(eventName, metadata = {}) {
  if (typeof window === "undefined") return;

  const payload = {
    channel: "whatsapp",
    eventName,
    occurredAt: new Date().toISOString(),
    ...metadata,
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...payload,
    });
  }

  window.dispatchEvent(
    new CustomEvent("wove:whatsapp-share", {
      detail: payload,
    }),
  );

  sendAnalyticsPayload(payload);
}
