"use client";

import SettlementTabs from './SettlementTabs';
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { getSettlementDetails } from "../../lib/action/brandPartner";
import OverviewTab from './OverviewTab';

function SettlementDashboard({ settlement, getCurrencySymbol }) {

 return (
  <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">

            {/* Total Sold */}
            <div className="relative flex h-[90px] w-[260px] border border-[#BEDBFF] items-center justify-between rounded-xl bg-blue-50 p-4 shadow-sm">
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
            <div className="relative flex h-[90px] w-[260px] border border-[#E2E8F0] items-center justify-between rounded-xl bg-green-50 p-4 shadow-sm">
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
            <div className="relative flex h-[90px] w-[260px] border border-[#E2E8F0] items-center justify-between rounded-xl bg-purple-50 p-4 shadow-sm">
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
            <div className="relative flex h-[90px] w-[260px] border border-[#E2E8F0] items-center justify-between rounded-xl bg-orange-50 p-4 shadow-sm">
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
     
      {/* </main> */}

      {/* Tabs Section */}
  
    {/* </div> */}
  </>
);

}

export default SettlementDashboard;