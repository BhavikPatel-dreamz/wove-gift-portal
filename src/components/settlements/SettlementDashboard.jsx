"use client";

import SettlementTabs from './SettlementTabs';
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { getSettlementDetails } from "../../lib/action/brandPartner";
import OverviewTab from './OverviewTab';

function SettlementDashboard({ settlement, getCurrencySymbol }) {
    
    
        if (!settlement) {
            return null;
        }
    
        const getMonthYear = (date) => {
            if (!date) return "N/A";
    
            try {
                return new Date(date).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                });
            } catch (error) {
                return "Invalid Date";
            }
        };

 return (
  <>
    {/* <div className="relative flex min-h-screen w-full flex-col bg-[#f7f8fa]"> */}
      {/* <main className="flex w-full flex-1 justify-center py-8 sm:py-12"> */}
        <div className="flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">

          {/* Title Section */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black tracking-tighter text-zinc-900 sm:text-4xl">
                {getMonthYear(settlement.periodStart)} Settlement
              </h1>
              <p className="text-base font-normal text-zinc-500">
                Review the complete financial breakdown for this period.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">

            {/* Total Sold */}
            <div className="relative flex h-[90px] w-[260px] items-center justify-between rounded-xl bg-blue-50 p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-blue-600">Total Sold</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getCurrencySymbol(settlement.currency)}{" "}
                  {settlement.totalSoldAmount.toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>

            {/* Total Redeemed */}
            <div className="relative flex h-[90px] w-[260px] items-center justify-between rounded-xl bg-green-50 p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-green-600">Total Redeemed</p>
                <p className="text-2xl font-bold text-green-600">
                  {getCurrencySymbol(settlement.currency)}{" "}
                  {settlement.redeemedAmount.toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Outstanding */}
            <div className="relative flex h-[90px] w-[260px] items-center justify-between rounded-xl bg-purple-50 p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-purple-600">Outstanding</p>
                <p className="text-2xl font-bold text-purple-600">
                  {getCurrencySymbol(settlement.currency)}{" "}
                  {settlement.outstandingAmount.toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Amount Owed */}
            <div className="relative flex h-[90px] w-[260px] items-center justify-between rounded-xl bg-orange-50 p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-orange-600">Amount Owed</p>
                <p className="text-2xl font-bold text-orange-600">
                  {getCurrencySymbol(settlement.currency)} {settlement.netPayable}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

          </div>
        </div>
      {/* </main> */}

      {/* Tabs Section */}
      <SettlementTabs settlementId={settlement.id} />
    {/* </div> */}
  </>
);

}

export default SettlementDashboard;