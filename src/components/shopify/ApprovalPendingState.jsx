"use client";

import { ShieldAlert, RefreshCw, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";

function formatDate(value) {
  if (!value) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

export default function ApprovalPendingState({
  shop,
  brandName,
  installedAt,
}) {
  const router = useRouter();
  const submittedAt = formatDate(installedAt);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">
                Store Access
              </p>
              <h1 className="text-2xl font-semibold">Approval Pending</h1>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-8 sm:px-8">
          <div className="space-y-3 text-gray-700">
            <p className="text-lg font-medium text-gray-900">
              {brandName || shop || "This store"} has been installed successfully.
            </p>
            <p>
              Your store is waiting for an admin to approve access before the
              Shopify app tools become available.
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl bg-amber-50 p-5 text-sm text-amber-950 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Store
              </p>
              <p className="mt-1 font-medium">{shop || "Unavailable"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Request Status
              </p>
              <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-medium text-amber-900">
                <Clock3 className="h-4 w-4" />
                Pending approval
              </div>
            </div>
            {submittedAt ? (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Submitted
                </p>
                <p className="mt-1 font-medium">{submittedAt}</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh status
            </button>
            <p className="text-sm text-gray-500">
              Once approved, reopen the app from Shopify Admin and you will get
              full access automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
