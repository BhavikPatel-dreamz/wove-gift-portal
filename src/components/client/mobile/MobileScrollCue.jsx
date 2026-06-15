"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

const MOBILE_QUERY = "(max-width: 767px)";
const BOTTOM_THRESHOLD = 96;

export default function MobileScrollCue() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);

    const updateVisibility = () => {
      if (!mediaQuery.matches) {
        setIsVisible(false);
        return;
      }

      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const hasMoreThanViewport = scrollableHeight > BOTTOM_THRESHOLD;
      const isNearBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - BOTTOM_THRESHOLD;

      setIsVisible(hasMoreThanViewport && !isNearBottom);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateVisibility);
    } else {
      mediaQuery.addListener(updateVisibility);
    }

    const observer =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(updateVisibility)
        : null;

    observer?.observe(document.body);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", updateVisibility);
      } else {
        mediaQuery.removeListener(updateVisibility);
      }
      observer?.disconnect();
    };
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden"
    >
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent" />
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 text-[#ED457D] shadow-[0_10px_28px_rgba(17,24,39,0.18)] mobile-scroll-cue-bounce">
        <ChevronDown className="h-5 w-5" />
      </div>
    </div>
  );
}
