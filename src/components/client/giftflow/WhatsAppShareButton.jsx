"use client";

import React from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  MessageCircle,
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
    reopenShare,
    share,
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
  const previewImageUrl = guideState.primaryGift?.giftImageUrl || "";
  const previewPageUrl = guideState.primaryGift?.giftImageViewUrl || previewImageUrl;
  const recipientName = guideState.primaryGift?.recipientName || "your recipient";
  const instructionLabel =
    guideState.deviceType === "desktop" ? "WhatsApp Web" : "WhatsApp";
  const isDesktopLike = guideState.deviceType === "desktop";
  const primaryActionLabel =
    status === "opened" ? "Open WhatsApp Again" : "Open WhatsApp";

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
        onClick={share}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-80 ${
          fullWidth ? "w-full" : ""
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
          We’ll open WhatsApp and show a quick share guide with the occasion
          card preview.
        </p>
      ) : null}

      {guideState.isOpen ? (
        <div
          className="fixed inset-0 z-[1300] bg-[#0F172A]/70 backdrop-blur-[2px] flex items-end justify-center sm:items-center sm:p-6"
          onClick={closeGuide}
        >
          <div
            className="flex h-[min(88vh,920px)] w-full max-w-5xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-[32px]"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="flex justify-center pt-3 sm:hidden">
              <span className="h-1.5 w-12 rounded-full bg-[#D1D5DB]" />
            </div>

            <div className="border-b border-[#EAEAEA] bg-[linear-gradient(135deg,#F6FFF9_0%,#FFFFFF_60%,#ECFDF5_100%)] px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#25D366]">
                    WhatsApp Share
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[#111827] sm:text-2xl">
                    Share your gift with {recipientName}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4B5563]">
                    {instructionLabel} should open with your prefilled message.
                    You can review the message here, copy it again if needed,
                    and use the occasion card preview for a richer share.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeGuide}
                  className="shrink-0 rounded-full p-2 text-[#6B7280] transition hover:bg-white hover:text-[#111827]"
                  aria-label="Close WhatsApp share guide"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-[#D8F5E3] bg-[#F6FFF9] p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-[#25D366]/15 p-2 text-[#1F9D55]">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#14532D]">
                          Share flow is ready
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[#166534]">
                          One tap opens WhatsApp and keeps this helper open so
                          the user knows exactly what to send next.
                        </p>
                      </div>
                    </div>
                  </div>

                  {previewImageUrl ? (
                    <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white">
                      {!previewImageFailed ? (
                        <div className="aspect-[16/10] w-full bg-[#F3F4F6]">
                          <img
                            src={previewImageUrl}
                            alt="Occasion card preview"
                            className="h-full w-full object-cover"
                            onError={() => {
                              setPreviewImageFailed(true);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex min-h-[180px] items-center justify-center bg-[#F3F4F6] px-6 text-center text-sm text-[#6B7280]">
                          Occasion card preview is not available here, but you
                          can still open the card or share the message.
                        </div>
                      )}
                      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#111827]">
                            Occasion card preview
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                            Open the card in a new tab if you want to attach the
                            occasion card image separately in WhatsApp.
                          </p>
                        </div>
                        {previewPageUrl ? (
                          <a
                            href={previewPageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#D1D5DB] px-4 py-2.5 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
                          >
                            View card
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-5 text-sm leading-6 text-[#6B7280]">
                      No occasion card preview is available for this gift, but
                      the message and redemption link are ready to share.
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
                    <p className="text-sm font-semibold text-[#111827]">
                      Share steps
                    </p>
                    <ol className="mt-4 space-y-3 text-sm leading-6 text-[#4B5563]">
                      <li className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
                          1
                        </span>
                        <span>WhatsApp opens with your prefilled gift message.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
                          2
                        </span>
                        <span>Check the gift amount, code, and redemption link.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
                          3
                        </span>
                        <span>Attach the occasion card image if you want a more visual share.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-xs font-semibold text-[#111827]">
                          4
                        </span>
                        <span>Press send inside WhatsApp.</span>
                      </li>
                    </ol>
                  </div>

                  {guideState.message ? (
                    <div className="rounded-3xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[#111827]">
                          Message preview
                        </p>
                        {!isDesktopLike ? (
                          <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-medium text-[#4B5563]">
                            Mobile ready
                          </span>
                        ) : null}
                      </div>
                      <pre className="mt-3 max-h-[260px] overflow-auto whitespace-pre-wrap break-words rounded-3xl bg-[#F9FAFB] p-4 text-[13px] leading-6 text-[#374151] sm:text-sm">
                        {guideState.message}
                      </pre>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="border-t border-[#EAEAEA] bg-white px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={reopenShare}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95 sm:flex-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  {primaryActionLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void copyGuideMessage();
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D1D5DB] px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB] sm:flex-1"
                >
                  <Copy className="h-4 w-4" />
                  Copy Message
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
