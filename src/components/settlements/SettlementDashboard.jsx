"use client";

import React from "react";
import { currencyList } from "../brandsPartner/currency";

const getCurrencySymbol = (code) =>
    currencyList.find((c) => c.code === code)?.symbol || "$";

function StatCard({ title, amount, currency, color, icon }) {
  const colorClasses = {
    blue: {
      bg: "bg-[#EFF6FE]",
      border: "border-[#BEDBFF]",
      text: "text-[#1F59EE]",
      iconBg: "bg-blue-100"
    },
    green: {
      bg: "bg-[#F0FDF4]",
      border: "border-[#E2E8F0]",
      text: "text-[#00813B]",
      iconBg: "bg-green-100"
    },
    purple: {
      bg: "bg-[#FAF5FF]",
      border: "border-[#E2E8F0]",
      text: "text-[#9810FA]",
      iconBg: "bg-purple-100"
    },
    orange: {
      bg: "bg-[#FFF7ED]",
      border: "border-[#E2E8F0]",
      text: "text-[#F55101]",
      iconBg: "bg-orange-100"
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`relative flex h-22.5 w-full border ${colors.border} items-center justify-between rounded-xl ${colors.bg} p-4 transition-transform hover:scale-105`}>
      <div className="flex flex-col gap-1">
        <p className={`text-sm sm:text-base font-medium ${colors.text}`}>{title}</p>
        <p className={`text-base sm:text-lg font-semibold ${colors.text}`}>
          {getCurrencySymbol(currency)}{amount?.toLocaleString() || "0"}
        </p>
      </div>
      <div className={`flex h-10 w-10 shrink-0 mb-5 items-center justify-center rounded-lg ${colors.iconBg}`}>
        <img src={icon} alt={title} className="h-5 w-5" />
      </div>
    </div>
  );
}

function SettlementDashboard({ settlement }) {
  // Debug log to check settlement data
  console.log("Settlement Dashboard Data:", {
    totalSoldAmount: settlement?.totalSoldAmount,
    redeemedAmount: settlement?.redeemedAmount,
    outstandingAmount: settlement?.outstandingAmount,
    netPayable: settlement?.netPayable,
  });

  if (!settlement) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-5">
          <div className="h-22.5 rounded-xl bg-gray-100 animate-pulse"></div>
          <div className="h-22.5 rounded-xl bg-gray-100 animate-pulse"></div>
          <div className="h-22.5 rounded-xl bg-gray-100 animate-pulse"></div>
          <div className="h-22.5 rounded-xl bg-gray-100 animate-pulse"></div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Sold",
      amount: settlement.totalSoldAmount || 0,
      color: "blue",
      icon: "/Frame (4).svg"
    },
    {
      title: "Total Redeemed",
      amount: settlement.redeemedAmount || 0,
      color: "green",
      icon: "/Frame (1).svg"
    },
    {
      title: "Outstanding",
      amount: settlement.outstandingAmount || 0,
      color: "purple",
      icon: "/Frame (2).svg"
    },
    {
      title: "Amount Owed",
      amount: settlement.netPayable || 0,
      color: "orange",
      icon: "/Frame (3).svg"
    }
  ];

  return (
    <div className="w-full">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-5">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            amount={stat.amount}
            currency={settlement.currency || "USD"}
            color={stat.color}
            icon={stat.icon}
          />
        ))}
      </div>
    </div>
  );
}

export default SettlementDashboard;