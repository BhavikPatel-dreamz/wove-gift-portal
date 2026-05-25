"use client";

import React from "react";
import {
  CheckCircle2,
  Copy,
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
  const recipientLabel =
    primaryGift.recipientName ||
    primaryGift.recipientFullName ||
    "your recipient";
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
  const headerChannelLabel = "WhatsApp";
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
        <svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M18.5813 16.7537C18.0135 16.9857 17.6508 17.8746 17.2829 18.3287C17.0942 18.5613 16.8692 18.5977 16.5792 18.4811C14.4481 17.632 12.8145 16.21 11.6386 14.2488C11.4394 13.9447 11.4751 13.7045 11.7153 13.4221C12.0704 13.0037 12.5169 12.5285 12.613 11.9648C12.8263 10.718 11.1962 6.8502 9.04347 8.60274C2.84898 13.6506 19.377 27.0387 22.36 19.7977C23.2037 17.7451 19.5223 16.3682 18.5813 16.7537ZM15.0001 27.3797C12.8093 27.3797 10.6536 26.7973 8.76633 25.6945C8.4634 25.517 8.09719 25.4701 7.75852 25.5621L3.65757 26.6877L5.08607 23.5406C5.18162 23.3305 5.21991 23.0989 5.19707 22.8692C5.17422 22.6395 5.09105 22.42 4.956 22.2328C3.42788 20.1146 2.61988 17.6139 2.61988 15C2.61988 8.17324 8.17336 2.61973 15.0001 2.61973C21.8268 2.61973 27.3797 8.17324 27.3797 15C27.3797 21.8262 21.8262 27.3797 15.0001 27.3797ZM15.0001 0C6.72903 0 0.00016435 6.72891 0.00016435 15C0.00016435 17.9098 0.826332 20.7041 2.39605 23.1293L0.117351 28.1479C0.0143827 28.3745 -0.0218954 28.6259 0.0127624 28.8724C0.0474201 29.119 0.15158 29.3505 0.313053 29.54C0.436205 29.6842 0.589117 29.7999 0.76127 29.8793C0.933423 29.9587 1.12073 29.9999 1.31031 30C2.15523 30 6.76243 28.5521 7.93489 28.2305C10.1023 29.39 12.5333 30 15.0001 30C23.2705 30 30 23.2705 30 15C30 6.72891 23.2705 0 15.0001 0Z" fill="white" />
        </svg>
        {STATUS_LABELS[status] || STATUS_LABELS.idle}
      </button>

      {/* {hasMediaHint ? (
        <p className={`mt-2 text-sm text-[#6B7280] ${helperClassName}`}>
          Your gift message and occasion card are ready to share beautifully.
        </p>
      ) : null} */}

      {guideState.isOpen ? (
        <div
          className="fixed inset-0 z-[1300] overflow-y-auto bg-[rgba(17,14,22,0.62)] p-3 backdrop-blur-[6px] sm:flex sm:items-center sm:justify-center sm:p-4 lg:p-5"
          onClick={closeGuide}
        >
          <div
            className="relative mx-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[720px] flex-col overflow-y-auto rounded-[22px] bg-[#FFF9F5] shadow-[0_24px_70px_rgba(54,30,43,0.24)] sm:max-h-[90dvh] sm:rounded-[28px] lg:max-w-[850px]"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {/* Compact gradient header area */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[300px] bg-[linear-gradient(120deg,#ED216D_0%,#FF4B4B_48%,#FF8A1F_100%)] sm:h-[335px]" />
              <div className="absolute left-[12%] top-[34px] h-3 w-3 rotate-45 rounded-[3px] bg-[#FFD84D] shadow-[0_6px_12px_rgba(255,216,77,0.35)] sm:left-[15%] sm:top-[40px] sm:h-4 sm:w-4" />
              <div className="absolute left-[17%] top-[92px] h-2.5 w-2.5 rotate-45 rounded-[3px] bg-white/90 sm:left-[18%] sm:top-[118px] sm:h-3 sm:w-3" />
              <div className="absolute right-[26%] top-[38px] h-3 w-3 rotate-45 rounded-[3px] bg-[#FFD84D] shadow-[0_6px_12px_rgba(255,216,77,0.35)] sm:right-[24%] sm:top-[32px] sm:h-4 sm:w-4" />
              <div className="absolute right-[18%] top-[56px] h-2.5 w-2.5 rotate-45 rounded-[3px] bg-[#5C49FF] shadow-[0_6px_12px_rgba(92,73,255,0.28)] sm:right-[16%] sm:top-[64px] sm:h-3 sm:w-3" />
              <div className="absolute right-[10%] top-[118px] h-3 w-3 rotate-45 rounded-[3px] bg-[#23C463] shadow-[0_6px_12px_rgba(35,196,99,0.3)] sm:top-[138px]" />

              <div className="absolute right-[1%] top-[9rem] h-3 w-3 rotate-45 rounded-[3px] bg-[#FFD84D] shadow-[0_6px_12px_rgba(255,216,77,0.35)] sm:right-[1%] sm:top-[9rem] sm:h-4 sm:w-4" />
              <div className="absolute right-[1%] top-[6rem] h-2.5 w-2.5 rotate-45 rounded-[3px] bg-[#5C49FF] shadow-[0_6px_12px_rgba(92,73,255,0.28)] sm:right-[1%] sm:top-[6rem] sm:h-3 sm:w-3" />
              {/* Mobile decorative ribbon */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/left_side_ribbon.png"
                alt=""
                aria-hidden="true"
                className="absolute left-[-20px] top-[-2px] h-[112px] w-auto object-contain sm:hidden"
              />
              {/* Mobile decorative gift */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/right_side_gift.svg"
                alt=""
                aria-hidden="true"
                className="absolute right-[-6px] top-[76px] h-[94px] w-auto object-contain sm:hidden"
              />
              {/* Desktop decorative ribbon */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/left_side_ribbon.png"
                alt=""
                aria-hidden="true"
                className="absolute left-[-15px] top-0 hidden h-[168px] w-auto object-contain sm:block md:left-[-6px] md:h-[186px] lg:left-0 lg:h-[208px]"
              />
              {/* Desktop decorative gift */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/right_side_gift.svg"
                alt=""
                aria-hidden="true"
                className="absolute right-[-10px] top-[72px] hidden h-[132px] w-auto object-contain sm:block md:right-[-6px] md:top-[62px] md:h-[146px] lg:right-0 lg:top-[46px] lg:h-[164px]"
              />
            </div>

            <div className="relative flex justify-center pt-2 sm:hidden">
              <span className="h-1 w-10 rounded-full bg-[#D1D5DB]" />
            </div>

            <div className="relative px-3 pt-3 sm:px-4 sm:pt-4">
              <button
                type="button"
                onClick={closeGuide}
                className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#45404A] shadow-[0_10px_24px_rgba(18,18,23,0.14)] transition hover:scale-[1.03] hover:text-[#111827] sm:right-4 sm:top-4 sm:h-9 sm:w-9"
                aria-label="Close WhatsApp share popup"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <div className="relative overflow-hidden rounded-[20px] px-3 pb-8 pt-3 text-center text-white sm:px-6 sm:pb-10 sm:pt-4 lg:px-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#FF2D6C] shadow-[0_12px_26px_rgba(255,255,255,0.18)] sm:h-14 sm:w-14">
                  <CheckCircle2 className="h-6 w-6 stroke-[2.5] sm:h-7 sm:w-7" />
                </div>

                <h3 className="mx-auto mt-4 max-w-[240px] text-[1.75rem] font-bold leading-[1.2] tracking-[-0.02em] sm:mt-5 sm:max-w-[480px] sm:text-[2.25rem] lg:max-w-[520px]">
                  Your gift message is ready!
                </h3>

                <p className="mx-auto mt-2 max-w-[240px] text-[13px] leading-5 text-white/94 sm:mt-3 sm:max-w-[500px] sm:text-[0.95rem] sm:leading-6">
                  Copy the message below and send it to {recipientLabel} on {headerChannelLabel}.
                </p>
              </div>
            </div>

            <div className="relative mt-2 flex-1 px-3 pb-3 before:absolute before:inset-x-0 before:top-0 before:z-0 before:h-[100px] before:rounded-t-[60px] before:bg-[#FFF9F5] before:content-[''] sm:px-4 sm:pb-4">
              <div className="-mt-10">
                <div className="relative z-10 rounded-[24px] bg-white px-4 pb-4 pt-4 shadow-[0_22px_55px_rgba(36,20,45,0.12)] sm:rounded-[28px] sm:px-5 sm:pb-5 sm:pt-5 md:max-w-[80%] mx-auto">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#15A84A] text-white shadow-[0_10px_18px_rgba(21,168,74,0.22)] sm:h-12 sm:w-12">
                        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M18.5813 16.7537C18.0135 16.9857 17.6508 17.8746 17.2829 18.3287C17.0942 18.5613 16.8692 18.5977 16.5792 18.4811C14.4481 17.632 12.8145 16.21 11.6386 14.2488C11.4394 13.9447 11.4751 13.7045 11.7153 13.4221C12.0704 13.0037 12.5169 12.5285 12.613 11.9648C12.8263 10.718 11.1962 6.8502 9.04347 8.60274C2.84898 13.6506 19.377 27.0387 22.36 19.7977C23.2037 17.7451 19.5223 16.3682 18.5813 16.7537ZM15.0001 27.3797C12.8093 27.3797 10.6536 26.7973 8.76633 25.6945C8.4634 25.517 8.09719 25.4701 7.75852 25.5621L3.65757 26.6877L5.08607 23.5406C5.18162 23.3305 5.21991 23.0989 5.19707 22.8692C5.17422 22.6395 5.09105 22.42 4.956 22.2328C3.42788 20.1146 2.61988 17.6139 2.61988 15C2.61988 8.17324 8.17336 2.61973 15.0001 2.61973C21.8268 2.61973 27.3797 8.17324 27.3797 15C27.3797 21.8262 21.8262 27.3797 15.0001 27.3797ZM15.0001 0C6.72903 0 0.00016435 6.72891 0.00016435 15C0.00016435 17.9098 0.826332 20.7041 2.39605 23.1293L0.117351 28.1479C0.0143827 28.3745 -0.0218954 28.6259 0.0127624 28.8724C0.0474201 29.119 0.15158 29.3505 0.313053 29.54C0.436205 29.6842 0.589117 29.7999 0.76127 29.8793C0.933423 29.9587 1.12073 29.9999 1.31031 30C2.15523 30 6.76243 28.5521 7.93489 28.2305C10.1023 29.39 12.5333 30 15.0001 30C23.2705 30 30 23.2705 30 15C30 6.72891 23.2705 0 15.0001 0Z" fill="white" />
                        </svg>

                      </div>
                      <div>
                        <p className="text-[0.85rem] font-bold uppercase tracking-[0.04em] text-[#16A34A] sm:text-[0.95rem]">
                          WhatsApp Preview
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        void copyGuideMessage();
                      }}
                      className="relative inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-[#22A34B] bg-white px-3 py-1.5 text-xs font-medium text-[#179543] shadow-sm transition hover:bg-[#F2FFF6] sm:px-4 sm:py-2 sm:text-sm"
                    >
                      <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Copy message
                    </button>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[20px] border border-[#E8E8E8] bg-white shadow-[0_14px_32px_rgba(25,25,30,0.06)]">
                    {previewImageUrl && !previewImageFailed ? (
                      <div className="overflow-hidden rounded-b-none rounded-t-[20px] bg-[#F6F4F2]">
                        <div className="relative aspect-[15/6.2] w-full">
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
                      <div className="flex min-h-[120px] items-center justify-center rounded-t-[20px] bg-[radial-gradient(circle_at_top,#3B1022_0%,#1B1020_55%,#0B0B10_100%)] px-3 text-center text-xs leading-5 text-white/78 sm:min-h-[140px] sm:px-4 sm:text-sm sm:leading-6">
                        The occasion card preview is not available here, but your WhatsApp message is ready to share.
                      </div>
                    )}

                    <div className="bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FFF9_100%)] p-3 sm:p-4">
                      <div className="rounded-[16px]">
                        <div className="space-y-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
                            <div className="text-left">
                              {visibleMessage ? (
                                <pre className="whitespace-pre-wrap break-words font-sans text-[12px] leading-5 text-[#101418] sm:text-sm sm:leading-6">
                                  {visibleMessage}
                                </pre>
                              ) : (
                                <p className="text-[12px] leading-5 text-[#101418] sm:text-sm sm:leading-6">
                                  Your gift message is ready to copy and share.
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#6B7280] sm:text-sm">
                              <span>11:30 AM</span>
                              <CheckCircle2 className="h-3 w-3 text-[#16A34A] sm:h-4 sm:w-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        void copyGuideMessage();
                      }}
                      className="rounded-[14px] border border-[#FF4C89] bg-white px-3 py-2.5 text-left shadow-[0_12px_28px_rgba(237,69,125,0.08)] transition hover:-translate-y-0.5 hover:border-[#ED457D] hover:bg-[#FFF8FB]"
                    >
                      <div className="flex items-center gap-2 text-[#ED457D]">
                        <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="text-sm font-semibold sm:text-base">
                          {copyActionLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#556070] sm:text-sm">
                        Copy entire message to clipboard
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={reopenShare}
                      className="rounded-[14px] bg-[linear-gradient(135deg,#18B84D_0%,#0F9B3C_100%)] px-3 py-2.5 text-left text-white shadow-[0_16px_36px_rgba(16,163,74,0.2)] transition hover:-translate-y-0.5 hover:brightness-95"
                    >
                      <div className="flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M18.5813 16.7537C18.0135 16.9857 17.6508 17.8746 17.2829 18.3287C17.0942 18.5613 16.8692 18.5977 16.5792 18.4811C14.4481 17.632 12.8145 16.21 11.6386 14.2488C11.4394 13.9447 11.4751 13.7045 11.7153 13.4221C12.0704 13.0037 12.5169 12.5285 12.613 11.9648C12.8263 10.718 11.1962 6.8502 9.04347 8.60274C2.84898 13.6506 19.377 27.0387 22.36 19.7977C23.2037 17.7451 19.5223 16.3682 18.5813 16.7537ZM15.0001 27.3797C12.8093 27.3797 10.6536 26.7973 8.76633 25.6945C8.4634 25.517 8.09719 25.4701 7.75852 25.5621L3.65757 26.6877L5.08607 23.5406C5.18162 23.3305 5.21991 23.0989 5.19707 22.8692C5.17422 22.6395 5.09105 22.42 4.956 22.2328C3.42788 20.1146 2.61988 17.6139 2.61988 15C2.61988 8.17324 8.17336 2.61973 15.0001 2.61973C21.8268 2.61973 27.3797 8.17324 27.3797 15C27.3797 21.8262 21.8262 27.3797 15.0001 27.3797ZM15.0001 0C6.72903 0 0.00016435 6.72891 0.00016435 15C0.00016435 17.9098 0.826332 20.7041 2.39605 23.1293L0.117351 28.1479C0.0143827 28.3745 -0.0218954 28.6259 0.0127624 28.8724C0.0474201 29.119 0.15158 29.3505 0.313053 29.54C0.436205 29.6842 0.589117 29.7999 0.76127 29.8793C0.933423 29.9587 1.12073 29.9999 1.31031 30C2.15523 30 6.76243 28.5521 7.93489 28.2305C10.1023 29.39 12.5333 30 15.0001 30C23.2705 30 30 23.2705 30 15C30 6.72891 23.2705 0 15.0001 0Z" fill="white" />
                        </svg>

                        <span className="text-sm font-semibold sm:text-base">
                          {primaryActionLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/88 sm:text-sm">
                        Open in a new tab
                      </p>
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col items-center justify-center gap-1.5 border-t border-[#ECE7E2] pt-3 text-center text-[#2F3842] sm:mt-5 sm:flex-row sm:gap-3 sm:pt-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium sm:text-sm">
                      <span className="text-xl lowercase leading-none text-[#ED457D] sm:text-2xl">w</span>
                      <span>Powered by WoveGifts</span>
                    </div>
                    <span className="hidden h-4 w-px bg-[#D6D1CB] sm:block" />
                    <span className="text-xs font-medium text-[#16A34A] sm:text-sm">
                      www.wovegifts.com
                    </span>
                  </div>
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
