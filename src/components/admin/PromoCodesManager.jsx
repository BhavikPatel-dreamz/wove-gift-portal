"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import DynamicTable from "@/components/forms/DynamicTable";
import { deletePromoCode } from "@/lib/action/promoCodeAction";

function formatDateTime(value) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getTypeLabel(type, discountValue, currency) {
  if (type === "PERCENTAGE") return `${discountValue}% off`;
  if (type === "FIXED_AMOUNT") return `${currency} ${discountValue} off`;
  return "100% free gift";
}

function getStatusLabel(promo) {
  const now = Date.now();
  const startsAt = promo.startsAt ? new Date(promo.startsAt).getTime() : null;
  const endsAt = promo.endsAt ? new Date(promo.endsAt).getTime() : null;

  if (!promo.isActive) return "Inactive";
  if (startsAt && startsAt > now) return "Scheduled";
  if (endsAt && endsAt < now) return "Expired";
  return "Active";
}

export default function PromoCodesManager({
  initialPromoCodes,
}) {
  const [promoCodes, setPromoCodes] = useState(initialPromoCodes);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isPending, startTransition] = useTransition();
  const columnHelper = createColumnHelper();

  const filteredPromoCodes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return promoCodes.filter((promo) => {
      const matchesStatus = !statusFilter || getStatusLabel(promo) === statusFilter;
      const matchesType = !typeFilter || promo.type === typeFilter;
      const matchesSearch =
        !query ||
        [promo.code, promo.description, promo.type]
          .filter(Boolean)
          .some((item) => String(item).toLowerCase().includes(query));

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [promoCodes, searchQuery, statusFilter, typeFilter]);

  const handleDelete = (promo) => {
    if (!confirm(`Delete promo code ${promo.code}? This cannot be undone.`)) return;

    startTransition(async () => {
      try {
        await deletePromoCode(promo.id);
        setPromoCodes((prev) => prev.filter((item) => item.id !== promo.id));
        toast.success("Promo code deleted.");
      } catch (error) {
        toast.error(error.message || "Failed to delete promo code.");
      }
    });
  };

  const StatusBadge = ({ promo }) => {
    const status = getStatusLabel(promo);
    const statusClass =
      status === "Active"
        ? "bg-green-50 text-green-600 border-green-200"
        : status === "Scheduled"
          ? "bg-amber-50 text-amber-600 border-amber-200"
          : "bg-gray-100 text-gray-600 border-gray-200";

    return (
      <span className={`inline-flex items-center justify-center rounded-lg border px-2 py-1 text-xs font-semibold ${statusClass}`}>
        {status}
      </span>
    );
  };

  const ActionButtons = ({ promo }) => (
    <div className="flex items-center gap-2">
      <Link
        href={`/controls/${promo.id}/edit`}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Edit promo code"
      >
        <Pencil className="w-4 h-4" />
      </Link>
      <button
        type="button"
        onClick={() => handleDelete(promo)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete promo code"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  const columns = [
    columnHelper.accessor("code", {
      header: "Code",
      cell: (info) => <span className="font-semibold text-gray-900">{info.getValue()}</span>,
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => (
        <span className="font-medium text-gray-700">
          {getTypeLabel(info.row.original.type, info.row.original.discountValue, info.row.original.currency)}
        </span>
      ),
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: (info) => <span className="text-gray-700">{info.getValue() || "-"}</span>,
    }),
    columnHelper.accessor("usageCount", {
      header: "Usage",
      cell: (info) => (
        <span className="text-gray-700">
          {info.row.original.usageCount} / {info.row.original.usageLimit ?? "Unlimited"}
        </span>
      ),
    }),
    columnHelper.accessor("startsAt", {
      header: "Start Date",
      cell: (info) => <span className="text-gray-700">{formatDateTime(info.getValue())}</span>,
    }),
    columnHelper.accessor("endsAt", {
      header: "End Date",
      cell: (info) => <span className="text-gray-700">{info.getValue() ? formatDateTime(info.getValue()) : "No expiry"}</span>,
    }),
    columnHelper.display({
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge promo={row.original} />,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <ActionButtons promo={row.original} />,
    }),
  ];

  return (
    <div className="space-y-6 max-w-full mx-auto text-black">
      <DynamicTable
        data={filteredPromoCodes}
        columns={columns}
        loading={isPending}
        title="Promo Codes"
        subtitle="Create, update, and manage percentage discounts, fixed-value coupons, and 100% free gift redemptions."
        searchPlaceholder="Search by promo code, description, or type..."
        onSearch={setSearchQuery}
        onFilter={(name, value) => {
          if (name === "status") setStatusFilter(value);
          if (name === "type") setTypeFilter(value);
        }}
        filters={[
          {
            name: "status",
            placeholder: "All Status",
            value: statusFilter,
            options: [
              { value: "Active", label: "Active" },
              { value: "Scheduled", label: "Scheduled" },
              { value: "Expired", label: "Expired" },
              { value: "Inactive", label: "Inactive" },
            ],
          },
          {
            name: "type",
            placeholder: "All Types",
            value: typeFilter,
            options: [
              { value: "PERCENTAGE", label: "% off" },
              { value: "FIXED_AMOUNT", label: "Fixed amount off" },
              { value: "FREE_GIFT", label: "100% free gift" },
            ],
          },
        ]}
        actions={[
          {
            label: "Add Promo Code",
            icon: Plus,
            onClick: () => {
              window.location.href = "/controls/new";
            },
            disabled: isPending,
          },
        ]}
        emptyMessage="No promo codes found. Try adjusting your search or filters."
      />
    </div>
  );
}
