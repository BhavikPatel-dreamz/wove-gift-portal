"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, BadgePercent, Gift, Plus, TicketPercent } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { createPromoCode, updatePromoCode } from "@/lib/action/promoCodeAction";

const EMPTY_FORM = {
  code: "",
  description: "",
  type: "PERCENTAGE",
  discountValue: "",
  currency: "ZAR",
  minOrderAmount: "",
  usageLimit: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
};

function toDateInputValue(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

function getInitialState(initialPromoCode) {
  if (!initialPromoCode) return EMPTY_FORM;

  return {
    code: initialPromoCode.code || "",
    description: initialPromoCode.description || "",
    type: initialPromoCode.type || "PERCENTAGE",
    discountValue:
      initialPromoCode.type === "FREE_GIFT"
        ? "100"
        : String(initialPromoCode.discountValue ?? ""),
    currency: initialPromoCode.currency || "ZAR",
    minOrderAmount: initialPromoCode.minOrderAmount ?? "",
    usageLimit: initialPromoCode.usageLimit ?? "",
    startsAt: toDateInputValue(initialPromoCode.startsAt),
    endsAt: toDateInputValue(initialPromoCode.endsAt),
    isActive: Boolean(initialPromoCode.isActive),
  };
}

export default function PromoCodeForm({ initialPromoCode = null }) {
  const router = useRouter();
  const [formState, setFormState] = useState(getInitialState(initialPromoCode));
  const [isPending, startTransition] = useTransition();
  const isEditMode = Boolean(initialPromoCode?.id);

  const handleChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "type" && value === "FREE_GIFT" ? { discountValue: "100" } : {}),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      ...formState,
      discountValue: formState.type === "FREE_GIFT" ? 100 : formState.discountValue,
    };

    startTransition(async () => {
      try {
        if (isEditMode) {
          await updatePromoCode(initialPromoCode.id, payload);
          toast.success("Promo code updated.");
        } else {
          await createPromoCode(payload);
          toast.success("Promo code created.");
        }

        router.push("/controls");
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Failed to save promo code.");
      }
    });
  };

  return (
    <div className="max-w-full mx-auto text-black">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white rounded-t-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[20px] font-semibold text-[#1A1A1A]">
                {isEditMode ? "Update Promo Code" : "Add Promo Code"}
              </h1>
              <p className="text-[#64748B] text-[14px] font-normal">
                Configure coupon behavior, validity dates, and redemption limits.
              </p>
            </div>

            <Link
              href="/controls"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to List
            </Link>
          </div>
        </div>

        <form className="p-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[#1A1A1A]">Promo Code</span>
              <input
                type="text"
                value={formState.code}
                onChange={(event) => handleChange("code", event.target.value.toUpperCase())}
                placeholder="SAVE20"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[#1A1A1A]">Promo Type</span>
              <select
                value={formState.type}
                onChange={(event) => handleChange("type", event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black"
              >
                <option value="PERCENTAGE">% off</option>
                <option value="FIXED_AMOUNT">Fixed amount off</option>
                {/* <option value="FREE_GIFT">100% free gift</option> */}
              </select>
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm font-medium text-[#1A1A1A]">Description</span>
            <textarea
              value={formState.description}
              onChange={(event) => handleChange("description", event.target.value)}
              rows={3}
              placeholder="Optional internal description"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[#1A1A1A]">
                {formState.type === "PERCENTAGE" ? "Percent Off" : "Discount Value"}
              </span>
              <div className="relative">
                <input
                  type="number"
                  value={formState.type === "FREE_GIFT" ? "100" : formState.discountValue}
                  onChange={(event) => handleChange("discountValue", event.target.value)}
                  disabled={formState.type === "FREE_GIFT"}
                  min="1"
                  max={formState.type === "PERCENTAGE" ? "100" : undefined}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black disabled:bg-gray-100"
                  required
                />
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                  {formState.type === "PERCENTAGE" ? (
                    <BadgePercent className="h-4 w-4" />
                  ) : formState.type === "FREE_GIFT" ? (
                    <Gift className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold">{formState.currency}</span>
                  )}
                </div>
              </div>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[#1A1A1A]">Currency</span>
              <input
                type="text"
                value={formState.currency}
                onChange={(event) => handleChange("currency", event.target.value.toUpperCase())}
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[#1A1A1A]">Minimum Order Amount</span>
              <input
                type="number"
                min="0"
                value={formState.minOrderAmount}
                onChange={(event) => handleChange("minOrderAmount", event.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[#1A1A1A]">Usage Limit</span>
              <input
                type="number"
                min="1"
                value={formState.usageLimit}
                onChange={(event) => handleChange("usageLimit", event.target.value)}
                placeholder="Leave blank for unlimited"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[#1A1A1A]">Starts At</span>
              <input
                type="datetime-local"
                value={formState.startsAt}
                onChange={(event) => handleChange("startsAt", event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[#1A1A1A]">Ends At</span>
              <input
                type="datetime-local"
                value={formState.endsAt}
                onChange={(event) => handleChange("endsAt", event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
            <input
              type="checkbox"
              checked={formState.isActive}
              onChange={(event) => handleChange("isActive", event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-700"
            />
            <span className="text-sm text-[#1A1A1A]">Promo code is active</span>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-sm font-medium text-white"
            >
              {isEditMode ? <TicketPercent className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isPending ? "Saving..." : isEditMode ? "Update Promo Code" : "Create Promo Code"}
            </button>

            <Link
              href="/controls"
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
