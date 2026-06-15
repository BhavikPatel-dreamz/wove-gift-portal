"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  copyMessageFallback,
  detectDeviceType,
  generateWhatsAppMessage,
  generateWhatsAppMultiGiftMessage,
  openWhatsAppShare,
} from "@/lib/whatsappShare";
import { trackWhatsAppShareEvent } from "@/lib/whatsappShareAnalytics";

export function useWhatsAppShare({
  context,
  gifts = [],
  messageTemplate,
  analyticsMetadata = {},
  defaultMessageData = {},
  autoOpenGuide = false,
} = {}) {
  const [status, setStatus] = useState("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const hasAutoOpenedGuideRef = useRef(false);
  const [guideState, setGuideState] = useState({
    isOpen: false,
    message: "",
    deviceType: detectDeviceType(),
    primaryGift: null,
  });

  const normalizedGifts = useMemo(
    () =>
      (Array.isArray(gifts) ? gifts : [])
        .filter((gift) => gift?.giftCode || gift?.giftUrl || gift?.giftAmount)
        .map((gift) => ({
          ...defaultMessageData,
          ...gift,
        })),
    [defaultMessageData, gifts],
  );

  const buildGuidePayload = useCallback(() => {
    if (normalizedGifts.length === 0) {
      return null;
    }

    const deviceType = detectDeviceType();
    const firstGift = normalizedGifts[0];
    const message =
      normalizedGifts.length > 1
        ? generateWhatsAppMultiGiftMessage({
            gifts: normalizedGifts,
            senderName: firstGift.senderName,
            customMessage: firstGift.customMessage,
            recipientName: firstGift.recipientName,
            template: messageTemplate,
          })
        : generateWhatsAppMessage({
            ...firstGift,
            template: messageTemplate,
          });

    return {
      deviceType,
      firstGift,
      message,
    };
  }, [messageTemplate, normalizedGifts]);

  const openGuideOnly = useCallback(() => {
    const payload = buildGuidePayload();

    if (!payload) {
      setStatus("error");
      setFeedbackMessage("Gift details are not ready for WhatsApp sharing yet.");
      return null;
    }

    setGuideState({
      isOpen: true,
      message: payload.message,
      deviceType: payload.deviceType,
      primaryGift: payload.firstGift,
    });

    setFeedbackMessage("Your WhatsApp share guide is ready.");
    return payload;
  }, [buildGuidePayload]);

  useEffect(() => {
    if (!autoOpenGuide || hasAutoOpenedGuideRef.current) {
      return;
    }

    if (normalizedGifts.length === 0) {
      return;
    }

    const payload = openGuideOnly();
    if (payload) {
      hasAutoOpenedGuideRef.current = true;
    }
  }, [autoOpenGuide, normalizedGifts.length, openGuideOnly]);

  const share = useCallback(() => {
    const payload = buildGuidePayload();
    if (!payload) {
      setStatus("error");
      setFeedbackMessage("Gift details are not ready for WhatsApp sharing yet.");
      return;
    }

    const { deviceType, firstGift, message } = payload;
    const baseMetadata = {
      context,
      deviceType,
      giftCount: normalizedGifts.length,
      ...analyticsMetadata,
    };

    const runCopyFallback = async (reason = "fallback") => {
      try {
        await copyMessageFallback(message);
        setStatus("copied");
        setFeedbackMessage(
          "Message copied. Paste it in WhatsApp and attach the occasion card if needed.",
        );
      } catch {
        setStatus("error");
        setFeedbackMessage("We couldn't copy the message automatically.");
      } finally {
        trackWhatsAppShareEvent("whatsapp_share_fallback_copy", {
          ...baseMetadata,
          fallbackReason: reason,
        });
      }
    };

    setStatus("opening");
    setFeedbackMessage("Opening WhatsApp with your formatted gift message...");
    setGuideState({
      isOpen: false,
      message,
      deviceType,
      primaryGift: firstGift,
    });
    trackWhatsAppShareEvent("whatsapp_share_clicked", baseMetadata);

    openWhatsAppShare({
      message,
      onOpened: ({ method }) => {
        setStatus("opened");
        setFeedbackMessage(
          method === "web"
            ? "WhatsApp Web opened. Your share guide is ready here too."
            : "WhatsApp opened. When you come back, your share guide will still be here.",
        );
        trackWhatsAppShareEvent("whatsapp_share_opened", {
          ...baseMetadata,
          openMethod: method,
        });
      },
      onBlocked: () => {
        void runCopyFallback("blocked");
      },
      onFallback: () => {
        void runCopyFallback("app_not_opened");
      },
    });
  }, [analyticsMetadata, buildGuidePayload, context, normalizedGifts.length]);

  const closeGuide = useCallback(() => {
    setGuideState((currentState) => ({
      ...currentState,
      isOpen: false,
    }));
  }, []);

  const copyGuideMessage = useCallback(async () => {
    if (!guideState.message) {
      return false;
    }

    try {
      await copyMessageFallback(guideState.message);
      setStatus("copied");
      setFeedbackMessage("Message copied. Paste it in WhatsApp.");
      trackWhatsAppShareEvent("whatsapp_share_fallback_copy", {
        context,
        deviceType: guideState.deviceType,
        giftCount: normalizedGifts.length,
        ...analyticsMetadata,
        fallbackReason: "manual_copy",
      });
      return true;
    } catch {
      setStatus("error");
      setFeedbackMessage("We couldn't copy the message automatically.");
      return false;
    }
  }, [
    analyticsMetadata,
    context,
    guideState.deviceType,
    guideState.message,
    normalizedGifts.length,
  ]);

  const reopenShare = useCallback(() => {
    if (!guideState.message) {
      return;
    }

    setStatus("opening");
    setFeedbackMessage("Opening WhatsApp again...");

    openWhatsAppShare({
      message: guideState.message,
      onOpened: ({ method }) => {
        setStatus("opened");
        setFeedbackMessage(
          method === "web"
            ? "WhatsApp Web opened again."
            : "WhatsApp opened again.",
        );
      },
      onBlocked: () => {
        void copyGuideMessage();
      },
      onFallback: () => {
        void copyGuideMessage();
      },
    });
  }, [copyGuideMessage, guideState.message]);

  return {
    feedbackMessage,
    guideState,
    closeGuide,
    copyGuideMessage,
    openGuideOnly,
    reopenShare,
    share,
    status,
  };
}
