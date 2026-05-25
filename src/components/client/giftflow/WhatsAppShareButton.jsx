"use client";

import React from "react";
import {
  CheckCircle2,
  Copy,
  Loader2,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";
import { useWhatsAppShare } from "@/hooks/useWhatsAppShare";

const STATUS_LABELS = {
  idle: "Share on WhatsApp",
  opening: "Opening WhatsApp...",
  opened: "Open WhatsApp Again",
  copied: "Copy Message Again",
  error: "Try WhatsApp Share Again",
};

const STATUS_ICONS = {
  idle: MessageCircle,
  opening: Loader2,
  opened: CheckCircle2,
  copied: Copy,
  error: MessageCircle,
};

const WhatsAppShareButton = ({
  gifts,
  context,
  analyticsMetadata,
  defaultMessageData,
  messageTemplate,
  autoOpenGuide = false,
  className = "",
  helperClassName = "",
  fullWidth = false,
}) => {
  const {
    closeGuide,
    copyGuideMessage,
    feedbackMessage,
    guideState,
    openGuideOnly,
    reopenShare,
    status,
  } = useWhatsAppShare({
    context,
    gifts,
    analyticsMetadata,
    defaultMessageData,
    messageTemplate,
    autoOpenGuide,
  });

  const Icon = STATUS_ICONS[status] || MessageCircle;
  const isLoading = status === "opening";
  const [previewImageFailed, setPreviewImageFailed] = React.useState(false);
  const hasMediaHint = Array.isArray(gifts)
    ? gifts.some((gift) => Boolean(gift?.giftImageUrl))
    : false;
  const giftCount = Array.isArray(gifts) ? gifts.length : 0;
  const primaryGift = guideState.primaryGift || {};
  const previewImageUrl = primaryGift.giftImageUrl || "";
  const occasionTitle =
    primaryGift.giftName || primaryGift.brandName || "Gift card";
  const brandName = primaryGift.brandName || "Wove Gift";
  const giftAmount = primaryGift.giftAmount || "";
  const hasMultipleGifts = giftCount > 1;
  const isDesktopLike = guideState.deviceType === "desktop";
  const primaryActionLabel =
    status === "opened"
      ? isDesktopLike
        ? "Reopen WhatsApp Web"
        : "Reopen WhatsApp"
      : isDesktopLike
        ? "Open WhatsApp Web"
        : "Open WhatsApp";
  const copyActionLabel =
    status === "copied" ? "Copied to Clipboard" : "Copy Full Message";
  const messagePreviewLabel = hasMultipleGifts
    ? `${giftCount} gifts prepared`
    : "1 gift prepared";
  const destinationLabel = isDesktopLike ? "WhatsApp Web" : "WhatsApp";
  const visibleMessage = React.useMemo(() => {
    const rawMessage = String(guideState.message || "").trim();
    if (!rawMessage) return "";

    const messageWithoutPreviewImage =
      previewImageUrl && rawMessage.startsWith(previewImageUrl)
        ? rawMessage.slice(previewImageUrl.length).trim()
        : rawMessage;

    return messageWithoutPreviewImage
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n");
  }, [guideState.message, previewImageUrl]);

  React.useEffect(() => {
    if (guideState.isOpen) {
      setPreviewImageFailed(false);
    }
  }, [guideState.isOpen, previewImageUrl]);

  React.useEffect(() => {
    if (!guideState.isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeGuide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeGuide, guideState.isOpen]);

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <button
        type="button"
        onClick={openGuideOnly}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#25D366_0%,#16A34A_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,211,102,0.24)] transition hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-80 ${fullWidth ? "w-full" : ""
          } ${className}`}
        disabled={isLoading}
      >
        <Icon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        {STATUS_LABELS[status] || STATUS_LABELS.idle}
      </button>

      {feedbackMessage ? (
        <p className={`mt-2 text-sm text-[#4A4A4A] ${helperClassName}`}>
          {feedbackMessage}
        </p>
      ) : null}

      {hasMediaHint ? (
        <p className={`mt-2 text-sm text-[#6B7280] ${helperClassName}`}>
          Your gift message and occasion card are ready to share beautifully.
        </p>
      ) : null}

      {guideState.isOpen ? (
        <div
          className="fixed inset-0 z-[1300] overflow-y-auto bg-[rgba(17,14,22,0.62)] p-3 backdrop-blur-[6px] sm:flex sm:items-center sm:justify-center sm:p-4 lg:p-6"
          onClick={closeGuide}
        >
          <div
            className="relative mx-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[680px] flex-col overflow-y-auto rounded-[22px] bg-[#FFF9F5] shadow-[0_24px_70px_rgba(54,30,43,0.24)] sm:max-h-[88dvh] sm:rounded-[24px]"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[180px] bg-[linear-gradient(120deg,#ED216D_0%,#FF4B4B_48%,#FF8A1F_100%)] sm:h-[210px]" />
              <div className="absolute left-[-32px] top-[-28px] hidden h-64 w-20 rotate-[10deg] rounded-full bg-[linear-gradient(180deg,#FFD25F_0%,#E34A8B_48%,#1EB95C_100%)] opacity-95 blur-[1px] sm:block" />
              <div className="absolute left-8 top-0 hidden h-60 w-8 -rotate-[18deg] rounded-full bg-[linear-gradient(180deg,#A0005C_0%,#FFCD4E_48%,#E34A8B_100%)] sm:block" />
              <div className="absolute right-[-8px] top-12 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,214,133,0.95),rgba(255,143,66,0.12)_58%,transparent_76%)] sm:top-16 sm:h-36 sm:w-36" />
              <div className="absolute left-[14%] top-16 h-4 w-4 rotate-45 rounded-[4px] bg-[#FFD84D]" />
              <div className="absolute left-[18%] top-28 h-3 w-3 rotate-45 rounded-[3px] bg-white/85" />
              <div className="absolute left-[6%] top-36 h-3.5 w-3.5 rotate-45 rounded-[4px] bg-[#23C463]" />
              <div className="absolute right-[28%] top-14 h-4 w-4 rotate-45 rounded-[4px] bg-[#FFD84D]" />
              <div className="absolute right-[20%] top-18 h-2.5 w-2.5 rotate-45 rounded-[3px] bg-[#FFA43A]" />
              <div className="absolute right-[13%] top-24 h-3 w-3 rotate-45 rounded-[3px] bg-[#5C49FF]" />
              <div className="absolute right-[10%] top-8 h-3.5 w-3.5 rotate-45 rounded-[4px] bg-[#FFD84D]" />
              <div className="absolute bottom-40 left-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-28 right-24 h-28 w-28 rounded-full bg-[#FFCA7A]/20 blur-3xl" />
            </div>

            <div className="relative flex justify-center pt-3 sm:hidden">
              <span className="h-1.5 w-12 rounded-full bg-[#D1D5DB]" />
            </div>

            <div className="relative px-4 pt-4 sm:px-5 sm:pt-5">
              <button
                type="button"
                onClick={closeGuide}
                className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#45404A] shadow-[0_10px_24px_rgba(18,18,23,0.14)] transition hover:scale-[1.03] hover:text-[#111827] sm:right-5 sm:top-5"
                aria-label="Close WhatsApp share popup"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative overflow-hidden rounded-[20px] px-4 pb-10 pt-3 text-center text-white sm:px-6 sm:pb-12 sm:pt-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#FF2D6C] shadow-[0_12px_26px_rgba(255,255,255,0.18)] sm:h-16 sm:w-16">
                  <CheckCircle2 className="h-7 w-7 stroke-[2.5] sm:h-8 sm:w-8" />
                </div>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/95 backdrop-blur">
                  <Sparkles className="h-3 w-3" />
                  Gift Message Prepared
                </div>

                <h3 className="mx-auto mt-3 max-w-2xl text-[1.45rem] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[1.7rem]">
                  Your gift message is ready!
                </h3>

                <p className="mx-auto mt-2 max-w-xl text-[13px] leading-5 text-white/92 sm:text-sm sm:leading-6">
                  Copy the message below and share it on {destinationLabel}.
                </p>

                <div className="absolute right-4 top-8 hidden lg:block">
                  <div className="relative h-28 w-24">
                    <div className="absolute right-0 top-7 h-16 w-16 rounded-[16px] bg-[linear-gradient(180deg,#FF6E8C_0%,#EF2E67_100%)] shadow-[0_18px_36px_rgba(84,14,34,0.28)]" />
                    <div className="absolute right-2 top-0 h-16 w-16 rounded-[14px] bg-[linear-gradient(180deg,#FF8AA2_0%,#FF4D79_100%)] shadow-[0_14px_28px_rgba(84,14,34,0.2)]" />
                    <div className="absolute right-[2rem] top-0 h-24 w-3 rounded-full bg-[linear-gradient(180deg,#FDE38C_0%,#F5B23E_100%)] shadow-[0_0_16px_rgba(255,226,142,0.42)]" />
                    <div className="absolute right-1 top-5 h-5 w-20 rounded-full bg-[linear-gradient(180deg,#FFE08A_0%,#F2A923_100%)]" />
                    <div className="absolute right-5 top-[-2px] h-10 w-10 rotate-12 rounded-[14px] border-[5px] border-[#F7C34A] border-b-0 border-l-0" />
                    <div className="absolute right-11 top-[-2px] h-10 w-10 -rotate-12 rounded-[14px] border-[5px] border-[#F7C34A] border-b-0 border-r-0" />
                    <div className="absolute bottom-2 right-[-4px] flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_10px_20px_rgba(57,29,39,0.2)]">
                      <span className="text-4xl font-semibold lowercase leading-none text-[#ED457D]">w</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative -mt-5 flex-1 px-4 pb-4 sm:-mt-6 sm:px-5 sm:pb-5">
              <div className="rounded-[22px] bg-white px-4 pb-4 pt-4 shadow-[0_22px_55px_rgba(36,20,45,0.12)] sm:px-5 sm:pb-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF8EF] text-[#16A34A] sm:h-11 sm:w-11">
                      <MessageCircle className="h-5 w-5 fill-current stroke-[1.5] sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#16A34A] sm:text-[13px]">
                        WhatsApp Preview
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {messagePreviewLabel}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void copyGuideMessage();
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#22A34B] bg-white px-4 py-2.5 text-sm font-semibold text-[#179543] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#F2FFF6] sm:w-auto sm:px-5"
                  >
                    <Copy className="h-4 w-4" />
                    Copy message
                  </button>
                </div>

                <div className="mt-4 overflow-hidden rounded-[22px] border border-[#E8E8E8] bg-white shadow-[0_14px_32px_rgba(25,25,30,0.06)]">
                  {previewImageUrl && !previewImageFailed ? (
                    <div className="overflow-hidden rounded-b-none rounded-t-[22px] bg-[#F6F4F2]">
                      <div className="relative aspect-[16/7.2] w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewImageUrl}
                          alt={`${occasionTitle} occasion card`}
                          className="h-full w-full object-cover"
                          onError={() => {
                            setPreviewImageFailed(true);
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-[140px] items-center justify-center rounded-t-[22px] bg-[radial-gradient(circle_at_top,#3B1022_0%,#1B1020_55%,#0B0B10_100%)] px-4 text-center text-xs leading-6 text-white/78 sm:min-h-[160px] sm:px-5 sm:text-sm sm:leading-7">
                      The occasion card preview is not available here, but your WhatsApp message is ready to share.
                    </div>
                  )}

                  <div className="bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FFF9_100%)] p-3 sm:p-4">
                    <div className="rounded-[18px] border border-[#D8F0DD] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(31,50,35,0.05)] sm:px-5">
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-[#5C6671] sm:text-xs">
                          <span className="font-medium text-[#1F2937]">Share via:</span>
                          <span>{destinationLabel}</span>
                          <span className="hidden h-1 w-1 rounded-full bg-[#BEC7D0] sm:inline-block" />
                          <span>{brandName}</span>
                          {giftAmount ? (
                            <>
                              <span className="hidden h-1 w-1 rounded-full bg-[#BEC7D0] sm:inline-block" />
                              <span>{giftAmount}</span>
                            </>
                          ) : null}
                        </div>

                        <div className="text-left">
                          {visibleMessage ? (
                            <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-6 text-[#101418] sm:text-sm sm:leading-7">
                              {visibleMessage}
                            </pre>
                          ) : (
                            <p className="text-[13px] leading-6 text-[#101418] sm:text-sm sm:leading-7">
                              Your gift message is ready to copy and share.
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                          <div className="text-[11px] text-[#16A34A] sm:text-xs">
                            <p className="font-semibold">Powered by WoveGifts</p>
                            <p className="mt-1">www.wovegifts.com</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#6B7280] sm:text-sm">
                            <span>11:30 AM</span>
                            <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      void copyGuideMessage();
                    }}
                    className="rounded-[16px] border border-[#FF4C89] bg-white px-4 py-3 text-left shadow-[0_12px_28px_rgba(237,69,125,0.08)] transition hover:-translate-y-0.5 hover:border-[#ED457D] hover:bg-[#FFF8FB]"
                  >
                    <div className="flex items-center gap-3 text-[#ED457D]">
                      <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm font-semibold sm:text-base">
                        {copyActionLabel}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-[#556070] sm:text-sm">
                      Copy entire message to clipboard
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={reopenShare}
                    className="rounded-[16px] bg-[linear-gradient(135deg,#18B84D_0%,#0F9B3C_100%)] px-4 py-3 text-left text-white shadow-[0_16px_36px_rgba(16,163,74,0.2)] transition hover:-translate-y-0.5 hover:brightness-95"
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-4 w-4 fill-current stroke-[1.5] sm:h-5 sm:w-5" />
                      <span className="text-sm font-semibold sm:text-base">
                        {primaryActionLabel}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-white/88 sm:text-sm">
                      Open in a new tab
                    </p>
                  </button>
                </div>

                <div className="mt-5 flex flex-col items-center justify-center gap-2 border-t border-[#ECE7E2] pt-4 text-center text-[#2F3842] sm:flex-row sm:gap-4">
                  <div className="flex items-center gap-2 text-xs font-medium sm:text-sm">
                    <span className="text-2xl lowercase leading-none text-[#ED457D] sm:text-3xl">w</span>
                    <span>Powered by WoveGifts</span>
                  </div>
                  <span className="hidden h-5 w-px bg-[#D6D1CB] sm:block" />
                  <span className="text-xs font-medium text-[#16A34A] sm:text-sm">
                    www.wovegifts.com
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default WhatsAppShareButton;
