import React from "react";
import { Star, Sparkles, Send } from "lucide-react";

const steps = [
  {
    icon: Star,
    title: "Choose a brand",
    desc: "Filter by country to see local partners.",
    leftClassMd: "md:left-[25%]",
    rotateClassMd: "md:-rotate-[6deg]",
    zClassMd: "md:z-10",
  },
  {
    icon: Sparkles,
    title: "Personalize",
    desc: "Add a note (and optional video message).",
    leftClassMd: "md:left-[52%]",
    rotateClassMd: "md:rotate-[8deg]",
    zClassMd: "md:z-30",
  },
  {
    icon: Send,
    title: "Send & smile",
    desc: "Instant delivery; easy redemption at checkout.",
    leftClassMd: "md:left-[80%]",
    rotateClassMd: "md:-rotate-[6deg]",
    zClassMd: "md:z-10",
  },
];

export default function HowItWorksOverlap() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-20">
      <h2 className="text-center font-bold text-3xl md:text-4xl mb-14 text-gray-900">
        How It Works
      </h2>

      {/* Main container */}
      <div className="relative w-full h-auto md:h-96">
        {/* Mobile: scrollable row | Desktop: positioned overlaps */}
        <div className="flex md:block gap-6 overflow-x-auto md:overflow-visible px-2 md:px-0 items-stretch md:items-center justify-start md:justify-center snap-x snap-mandatory scroll-smooth">
          {steps.map(
            (
              { icon: Icon, title, desc, leftClassMd, rotateClassMd, zClassMd },
              idx
            ) => (
              <article
                key={idx}
                className={
                  "bg-white border border-gray-200 rounded-2xl shadow-md md:shadow-xl p-6 sm:p-8 w-64 flex-shrink-0 text-center snap-center " +
                  "md:w-72 md:absolute md:top-1/2 md:-translate-y-1/2 md:-translate-x-1/2 " +
                  leftClassMd +
                  " " +
                  rotateClassMd +
                  " " +
                  zClassMd +
                  " transition-all duration-300 hover:md:scale-110 hover:md:shadow-2xl hover:md:z-50"
                }
              >
                <div
                  className="mx-auto mb-5 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center
                             bg-gradient-to-br from-pink-500 via-orange-400 to-pink-400 shadow-lg"
                >
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
}
