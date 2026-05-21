"use client";

import React from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Gift,
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
  const previewPageUrl = primaryGift.giftImageViewUrl || previewImageUrl;
  const recipientName = primaryGift.recipientName || "your recipient";
  const occasionTitle =
    primaryGift.giftName || primaryGift.brandName || "Gift card";
  const brandName = primaryGift.brandName || "Wove Gift";
  const senderName = primaryGift.senderName || "Someone";
  const giftAmount = primaryGift.giftAmount || "";
  const customMessage = String(primaryGift.customMessage || "").trim();
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
          className="fixed inset-0 z-[1300] flex items-end justify-center bg-[rgba(26,26,26,0.48)] backdrop-blur-[4px] sm:items-center sm:p-6"
          onClick={closeGuide}
        >
          <div
            className="relative flex h-[min(92vh,960px)] w-full max-w-3xl flex-col overflow-hidden rounded-t-[30px] bg-[#FFF9F5] shadow-[0_30px_100px_rgba(54,30,43,0.28)] sm:h-auto sm:max-h-[92vh] sm:rounded-[34px]"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-[#FFD8E7]/70 blur-3xl" />
              <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#FFE8D2]/80 blur-3xl" />
              <div className="absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-[#FFF1E6]/75 blur-3xl" />
            </div>

            <div className="relative flex justify-center pt-3 sm:hidden">
              <span className="h-1.5 w-12 rounded-full bg-[#D1D5DB]" />
            </div>

            <div className="relative px-4 pt-4 sm:px-7 sm:pt-6">
              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0 flex-1 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#F7D8E4] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E25583] shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    Gift Message Prepared
                  </div>

                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#1B1321] sm:text-[32px]">
                    Your WhatsApp gift is ready to send
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={closeGuide}
                  className="shrink-0 rounded-full border border-[#F1E5DD] bg-white p-2 text-[#6B7280] shadow-sm transition hover:bg-white hover:text-[#111827]"
                  aria-label="Close WhatsApp share popup"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>
            </div>

            <div className="relative flex-1 overflow-y-auto px-4 py-4 sm:px-7 sm:py-7">
              <div className="space-y-5">
                <section className="overflow-hidden rounded-[32px] border border-[#F0E6E1] bg-white shadow-[0_20px_45px_rgba(36,20,45,0.09)]">

                  <div className="px-2 py-2 sm:px-2 sm:py-2">

                    {/* Gift Card */}
                    <div className="mx-auto w-full max-w-[360px] rounded-[28px] border border-[#EFE3DC] bg-white p-3 shadow-[0_12px_30px_rgba(31,18,38,0.08)]">

                      {previewImageUrl && !previewImageFailed ? (
                        <div className="overflow-hidden rounded-[22px] bg-[#F6F4F2]">

                          <div className="relative aspect-[4/3] w-full">
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
                        <div className="flex aspect-[3/4] items-center justify-center rounded-[22px] border border-dashed border-[#E5D6CF] bg-[#F8F4F1] px-6 text-center text-sm leading-6 text-[#7B7280]">
                          The occasion card preview is not available here, but
                          the message is ready to share.
                        </div>
                      )}

                      {/* Message */}
                      <div className="mt-4 rounded-[22px] bg-[#FFF9F6] p-4 sm:p-5">

                        <div className="text-left text-[15px] leading-6 text-[#332B38]">
                          {visibleMessage ? (
                            <pre className="whitespace-pre-wrap break-words text-left font-sans text-[15px] leading-6 text-[#332B38]">
                              {visibleMessage}
                            </pre>
                          ) : null}
                        </div>

                      </div>

                    </div>

                  </div>

                </section>

                {/* {customMessage ? (
                  <section className="rounded-[30px] border border-[#F4E4EB] bg-[linear-gradient(145deg,#FFF9FC_0%,#FFFFFF_100%)] p-5 shadow-[0_14px_34px_rgba(58,25,73,0.05)] sm:p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E25583]">
                      Personal Note
                    </p>
                    <p className="mt-3 text-base leading-8 text-[#3C2945]">
                      &quot;{customMessage}&quot;
                    </p>
                  </section>
                ) : null} */}
              </div>
            </div>

            <div className="relative border-t border-[#F0E6E1] bg-[rgba(255,249,245,0.96)] px-4 py-4 backdrop-blur sm:px-7 sm:py-5">
              <div className="mx-auto flex max-w-[460px] flex-col gap-3 sm:max-w-none sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    void copyGuideMessage();
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(120deg,#ED457D_0%,#FA8F42_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(237,69,125,0.24)] transition hover:-translate-y-0.5 sm:flex-1"
                >
                  <Copy className="h-4 w-4" />
                  {copyActionLabel}
                </button>
                <button
                  type="button"
                  onClick={reopenShare}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#E7D5CC] bg-[#FFF8F3] px-5 py-3.5 text-sm font-semibold text-[#1B1321] transition hover:bg-[#FFF1E8] sm:flex-1"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  {primaryActionLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default WhatsAppShareButton;
