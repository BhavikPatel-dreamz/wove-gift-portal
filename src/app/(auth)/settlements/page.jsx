// app/dashboard/page.jsx
"use client"

import React from "react"
import DynamicTable from "../../../components/forms/DynamicTable"
import { createColumnHelper } from "@tanstack/react-table"
import { Clock, CheckCircle, AlertTriangle, Eye, Download } from "lucide-react"

const Page = () => {
  const sampleData = [
    {
      id: 1,
      brandName: "Superbalist",
      totalSold: 245000,
      redeemed: { amount: 189000, percentage: 77 },
      outstanding: 56000,
      settlementTerms: "30-day",
      amountOwed: 22050,
      lastPayment: "2024-05-15",
      status: "Pending",
    },
    {
      id: 2,
      brandName: "Freedom of Movement",
      totalSold: 198000,
      redeemed: { amount: 156000, percentage: 79 },
      outstanding: 42000,
      settlementTerms: "Immediate",
      amountOwed: 17820,
      lastPayment: "2024-05-28",
      status: "Paid",
    },
    {
      id: 3,
      brandName: "Huxlee",
      totalSold: 167000,
      redeemed: { amount: 134000, percentage: 80 },
      outstanding: 33000,
      settlementTerms: "30-day",
      amountOwed: 15030,
      lastPayment: "2024-05-10",
      status: "Review",
    },
    {
      id: 4,
      brandName: "Burnt Studios",
      totalSold: 145000,
      redeemed: { amount: 112000, percentage: 77 },
      outstanding: 33000,
      settlementTerms: "30-day",
      amountOwed: 13050,
      lastPayment: "2024-05-20",
      status: "Pending",
    },
  ]

  const columnHelper = createColumnHelper()

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Pending: {
        icon: Clock,
        color: "text-amber-600 bg-amber-50 border-amber-200",
        iconColor: "text-amber-600",
      },
      Paid: {
        icon: CheckCircle,
        color: "text-green-600 bg-green-50 border-green-200",
        iconColor: "text-green-600",
      },
      Review: {
        icon: AlertTriangle,
        color: "text-red-600 bg-red-50 border-red-200",
        iconColor: "text-red-600",
      },
    }

    const config = statusConfig[status] || statusConfig.Pending
    const IconComponent = config.icon

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium border ${config.color}`}
      >
        <IconComponent size={14} className={config.iconColor} />
        {status}
      </div>
    )
  }

  const ActionButtons = ({ row, onView, onDownload, onMarkPaid }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onView(row.original)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
      >
        <Eye size={14} />
        View
      </button>
      <button
        onClick={() => onDownload(row.original)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
      >
        <Download size={14} />
        CSV
      </button>
      {row.original.status === "Pending" && (
        <button
          onClick={() => onMarkPaid(row.original)}
          className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
        >
          Mark Paid
        </button>
      )}
    </div>
  )

  const customColumns = [
    columnHelper.accessor("brandName", {
      header: "Brand Name",
      cell: (info) => (
        <div className="font-medium text-gray-900">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor("totalSold", {
      header: "Total Sold",
      cell: (info) => (
        <div className="text-gray-900">R {info.getValue().toLocaleString()}</div>
      ),
    }),
    columnHelper.accessor("redeemed", {
      header: "Redeemed",
      cell: (info) => {
        const redeemed = info.getValue()
        return (
          <div>
            <div className="text-gray-900">
              R {redeemed.amount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              {redeemed.percentage}% redeemed
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor("outstanding", {
      header: "Outstanding",
      cell: (info) => (
        <div className="text-gray-900">R {info.getValue().toLocaleString()}</div>
      ),
    }),
    columnHelper.accessor("settlementTerms", {
      header: "Settlement Terms",
      cell: (info) => (
        <div className="text-gray-700">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor("amountOwed", {
      header: "Amount Owed",
      cell: (info) => (
        <div className="font-medium text-green-600">
          R {info.getValue().toLocaleString()}
        </div>
      ),
    }),
    columnHelper.accessor("lastPayment", {
      header: "Last Payment",
      cell: (info) => <div className="text-gray-700">{info.getValue()}</div>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionButtons
          row={row}
          onView={handleView}
          onDownload={handleDownload}
          onMarkPaid={handleMarkPaid}
        />
      ),
    }),
  ]

  const handleView = (row) => {
    alert(`Viewing details for: ${row.brandName}`)
  }

  const handleDownload = (row) => {
    alert(`Downloading CSV for: ${row.brandName}`)
  }

  const handleMarkPaid = (row) => {
    alert(`Marking as paid: ${row.brandName}`)
  }

  return (
    <div className="p-6">
      <DynamicTable
        data={sampleData}
        columns={customColumns}
        onView={handleView}
        onDownload={handleDownload}
        onMarkPaid={handleMarkPaid}
      />
    </div>
  )
}

export default Page
