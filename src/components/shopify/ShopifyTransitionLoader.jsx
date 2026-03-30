'use client';

import { Gift } from 'lucide-react';

const DEFAULT_STEPS = ['Check store access', 'Sync Shopify data', 'Open dashboard'];

export default function ShopifyTransitionLoader({
  title = 'Preparing your Shopify dashboard',
  description = 'We are checking the store connection, syncing the latest data, and finishing the handoff.',
  steps = DEFAULT_STEPS,
}) {
  return (
    <div
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-8"
      role="status"
      aria-live="polite"
    >
      <div className="absolute -left-24 -top-20 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-2xl backdrop-blur">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />

        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-200">
            <Gift className="h-8 w-8" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-600">
            Shopify App
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            {description}
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 animate-pulse" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={`${step}-${index}`}
                className={`rounded-2xl border p-4 text-left shadow-sm ${
                  index === 0
                    ? 'border-blue-200 bg-blue-50/70'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      index === 0
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Step {index + 1}
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-900">
                  {step}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-500">
            Keep this tab open while we finish the store setup.
          </p>
        </div>
      </div>
    </div>
  );
}
