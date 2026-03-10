import React from "react";
import SendIcon from '@/icons/SendIcon';
import StartIcon from '@/icons/StartIcon';
import SparklesIcon from '@/icons/SparklesIcon';

const steps = [
  {
    icon: StartIcon,
    title: "Choose brand & amount",
    desc: "Start by selecting a brand, then choose the gift card amount.",
    leftClass: "md:left-[20%] lg:left-[25%]",
    rotateClass: "md:-rotate-3 lg:-rotate-[6deg]",
    zClass: "md:z-10",
  },
  {
    icon: SparklesIcon,
    title: "Personalize the gift",
    desc: "Set occasion and category, then add your personal message.",
    leftClass: "md:left-[50%] lg:left-[52%]",
    rotateClass: "md:rotate-3 lg:rotate-[8deg]",
    zClass: "md:z-30",
  },
  {
    icon: SendIcon,
    title: "Deliver, review & pay",
    desc: "Choose timing/delivery (or bulk setup), review details, and pay securely.",
    leftClass: "md:left-[80%] lg:left-[80%]",
    rotateClass: "md:-rotate-3 lg:-rotate-[6deg]",
    zClass: "md:z-10",
  },
];

export default function HowItWorksOverlap() {
  return (
    <section className="max-w-5xl mx-auto px-4 ">
      <h2 className="text-center font-bold text-3xl md:text-4xl mb-14 text-gray-900">
        How It Works
      </h2>

      {/* Main container */}
      <div className="relative w-full h-auto md:h-96">
        {/* Mobile: scrollable row | Desktop: positioned overlaps */}
        <div className="flex lg:block gap-6 overflow-x-auto lg:overflow-visible px-2 lg:px-0 items-stretch lg:items-center justify-start lg:justify-center">
          {steps.map(
            (
              { icon: Icon, title, desc, leftClass, rotateClass, zClass },
              idx

            ) => (
              <article
                key={idx}
                className={
                  "bg-white border border-gray-200 rounded-2xl shadow-md md:shadow-xl p-6 sm:p-8 w-64 shrink-0 text-center snap-center " +
                  "md:w-64 lg:w-72 md:absolute md:top-1/2 md:-translate-y-1/2 md:-translate-x-1/2 " +
                  leftClass +
                  " " +
                  rotateClass +
                  " " +
                  zClass +
                  " transition-all duration-300 hover:md:scale-110 hover:md:shadow-2xl hover:md:z-50"
                }
              >
                <div
                  className="mx-auto mb-5 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center
                             bg-linear-to-br from-pink-500 via-orange-400 to-pink-400 shadow-lg"
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
