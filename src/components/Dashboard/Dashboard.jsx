'use client'

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Gift, DollarSign, CreditCard, Clock, TrendingUp, Users, Award, Package, Calendar, X } from 'lucide-react';

const Dashboard = ({ dashboardData, shopParam }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handlePeriodChange = (period) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    // Reset custom dates if a predefined period is chosen
    params.delete('startDate');
    params.delete('endDate');
    setShowCustomDatePicker(false);
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleCustomDateSubmit = () => {
    if (!customStartDate || !customEndDate) {
      alert('Please select both start and end dates');
      return;
    }

    if (new Date(customStartDate) > new Date(customEndDate)) {
      alert('Start date cannot be after end date');
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('period', 'custom');
    params.set('startDate', customStartDate);
    params.set('endDate', customEndDate);
    router.push(`/dashboard?${params.toString()}`);
    setShowCustomDatePicker(false);
  };

  const clearCustomDates = () => {
    setCustomStartDate('');
    setCustomEndDate('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('startDate');
    params.delete('endDate');
    params.set('period', 'month');
    router.push(`/dashboard?${params.toString()}`);
    setShowCustomDatePicker(false);
  };

  const PeriodFilter = () => {
    const period = searchParams.get('period') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const isCustom = period === 'custom' && startDate && endDate;

    const periods = [
      { value: 'day', label: 'Today' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
      { value: 'year', label: 'This Year' },
    ];

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 p-1 rounded-lg ">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePeriodChange(p.value)}
                className={`
        px-3 py-1.5 rounded-md transition-colors
        font-inter text-[14px] font-semibold leading-4.5
        ${period === p.value && !isCustom
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[#4A577F]/70 hover:bg-gray-200'
                  }
      `}
              >
                {p.label}
              </button>
            ))}
          </div>


          <button
            onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
            className={`
    flex items-center gap-2
    px-3 py-1.5 rounded-lg transition-colors
    font-inter text-[14px] font-semibold leading-4.5
    ${isCustom
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-[#4A577F]/70 hover:bg-gray-200'
              }
  `}
          >
            <Calendar className="w-4 h-4" />
            Custom Range
          </button>

        </div>

        {isCustom && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <span className="text-sm text-blue-900 font-medium">
              {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
            </span>
            <button
              onClick={clearCustomDates}
              className="ml-auto p-1 hover:bg-blue-100 rounded-full transition-colors"
              title="Clear custom dates"
            >
              <X className="w-4 h-4 text-blue-700" />
            </button>
          </div>
        )}

        {showCustomDatePicker && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg text-black">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Select Custom Date Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCustomDateSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => setShowCustomDatePicker(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };


  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendLabel,
    showTrend = false,
    color = "blue",
    currency = false
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-600",
      green: "bg-green-50 border-green-200 text-green-600",
      purple: "bg-purple-50 border-purple-200 text-purple-600",
      orange: "bg-orange-50 border-orange-200 text-orange-600"
    };
    const hasTrend = showTrend && typeof trend === 'number' && !Number.isNaN(trend);
    const isPositiveTrend = hasTrend && trend >= 0;

    return (
      <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all hover:scale-105 hover:shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="w-8 h-8">
            {icon}
          </div>
          {hasTrend && (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${isPositiveTrend
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
                }`}
            >
              {isPositiveTrend ? '+' : ''}{trend.toFixed(1)}%
            </span>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

          <p className="text-3xl font-bold text-gray-900">
            {currency && 'R'}{value}
          </p>

          <p className="text-sm text-gray-600">{subtitle}</p>
          {hasTrend && trendLabel && (
            <p className="text-xs text-gray-500">{trendLabel}</p>
          )}
        </div>
      </div>
    );
  };

  const ChartCard = ({ title, subtitle, children, className = "" }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      {children}
    </div>
  );

  const monthlyData = dashboardData?.trends?.monthly?.map(item => ({
    month: item.monthLabel,
    transactions: Number(item.totalAmount),
    orderCount: Number(item.orderCount),
    growth: item.growth,
  })) || [];

  const brandData = dashboardData?.topPerformers?.brands?.slice(0, 5).map((item, index) => ({
    name: item.brandName,
    value: item.metrics.totalRevenue,
    orderCount: item.metrics.orderCount,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5],
  })) || [];

  const weeklyData = dashboardData?.trends?.weekly?.daily?.map(item => ({
    day: item.dayName,
    value: Number(item.totalAmount),
    orders: Number(item.orderCount),
  })) || [];
  const selectedPeriod = searchParams.get('period') || 'month';
  const hasCustomRange = selectedPeriod === 'custom' && Boolean(searchParams.get('startDate') && searchParams.get('endDate'));
  const pendingComparisonText = (() => {
    switch (selectedPeriod) {
      case 'day':
        return 'vs previous day';
      case 'week':
        return 'vs last week';
      case 'month':
        return 'vs last month';
      case 'year':
        return 'vs last year';
      default:
        return hasCustomRange ? 'vs previous range' : 'vs previous period';
    }
  })();

  console.log("------",dashboardData?.metrics)

  return (
    <div className="min-h-screen bg-gray-50 px-1 py-6 md:py-6 md:px-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col items-center lg:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gift Card Analytics</h1>
            <p className="text-gray-600">Monitor your gift card performance and transactions</p>
          </div>
          <PeriodFilter />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Gift Cards Issued"
            value={dashboardData?.metrics?.giftCards?.totalIssued?.toLocaleString() || '0'}
            subtitle="Total vouchers created"
            icon={
              <div>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.7433 7.10444C9.68242 7.12313 8.62414 6.99354 7.59912 6.71944C5.31662 5.97694 4.84912 4.81277 4.84912 3.96944C4.85295 3.61324 4.92883 3.2615 5.07219 2.9354C5.21555 2.6093 5.42342 2.31558 5.68329 2.07194C6.26115 1.49061 7.0453 1.16114 7.86495 1.15527C9.40495 1.15527 10.1841 2.59444 10.7616 3.62111C11.1369 4.46273 11.4435 5.33335 11.6783 6.22444C11.7067 6.32556 11.7115 6.43184 11.6925 6.53513C11.6734 6.63841 11.6309 6.73596 11.5683 6.82027C11.5076 6.90542 11.428 6.97537 11.3358 7.02466C11.2435 7.07396 11.1411 7.10126 11.0366 7.10444H10.7433ZM7.76412 2.52111C7.32881 2.53986 6.91788 2.72724 6.61829 3.04361C6.48762 3.15883 6.38198 3.29963 6.30787 3.45729C6.23377 3.61496 6.19279 3.78614 6.18745 3.96027C6.18745 4.51944 6.86579 5.06027 8.02079 5.43611C8.69474 5.61031 9.38724 5.70264 10.0833 5.71111C9.93502 5.22294 9.69934 4.74521 9.48746 4.28111C8.95579 3.26361 8.49745 2.53944 7.79162 2.52111H7.76412Z" fill="#3B82F6" />
                  <path d="M11.2292 7.10421H11C10.8921 7.09981 10.7866 7.07038 10.692 7.01824C10.5974 6.9661 10.5163 6.89268 10.4549 6.80377C10.3936 6.71486 10.3537 6.61291 10.3386 6.50596C10.3234 6.39901 10.3333 6.29 10.3675 6.18754C10.6883 5.38087 10.9817 4.55587 11.22 3.74921C11.4217 3.12587 12.21 1.17337 14.19 1.17337C14.9617 1.14864 15.7116 1.43106 16.2753 1.95866C16.839 2.48625 17.1704 3.21592 17.1967 3.98754C17.1967 5.75671 15.1892 6.48087 14.4467 6.73754C13.3969 7.01146 12.3136 7.13492 11.2292 7.10421ZM14.1808 2.52087C13.1267 2.52087 12.65 3.74004 12.5308 4.11587C12.3658 4.64754 12.1917 5.17921 11.9992 5.71087C12.6563 5.7067 13.31 5.6142 13.9425 5.43587C14.465 5.25254 15.7758 4.75754 15.7758 3.96004C15.7476 3.56049 15.5657 3.1874 15.2683 2.91907C14.9709 2.65074 14.5812 2.50803 14.1808 2.52087Z" fill="#3B82F6" />
                  <path d="M19.4791 9.39616V8.25033C19.4791 7.58176 19.2136 6.94058 18.7408 6.46783C18.2681 5.99508 17.6269 5.72949 16.9583 5.72949H5.04165C4.37308 5.72949 3.7319 5.99508 3.25915 6.46783C2.7864 6.94058 2.52081 7.58176 2.52081 8.25033V9.39616H19.4791ZM11.6875 10.7712V20.8545H16.9583C17.6269 20.8545 18.2681 20.5889 18.7408 20.1162C19.2136 19.6434 19.4791 19.0022 19.4791 18.3337V10.7712H11.6875ZM10.3125 10.7712H2.52081V18.3337C2.52081 19.0022 2.7864 19.6434 3.25915 20.1162C3.7319 20.5889 4.37308 20.8545 5.04165 20.8545H10.3125V10.7712Z" fill="#3B82F6" />
                </svg>
              </div>
            }
            trend={dashboardData?.metrics?.giftCards?.growthRate}
            color="blue"
          />
          <MetricCard
            title="Total Value Issued"
            value={dashboardData?.metrics?.giftCards?.totalValue?.toLocaleString() || '0'}
            subtitle="Value of all issued vouchers"
            icon={<>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 0C17.0749 0.000109264 22 4.92505 22 11C21.9999 17.0749 17.0749 21.9999 11 22C4.92505 22 0.000109267 17.0749 0 11C0 4.92498 4.92498 0 11 0ZM7.46094 6.10449V16.21H9.59668V12.6279H11.1562L13.0703 16.21H15.4297L13.2842 12.2822C13.3151 12.2688 13.3468 12.2573 13.377 12.2432C13.9262 11.9866 14.3453 11.6179 14.6348 11.1377C14.9242 10.6542 15.0693 10.0771 15.0693 9.40625C15.0693 8.7385 14.9258 8.15747 14.6396 7.66406C14.3568 7.16744 13.944 6.78436 13.4014 6.51465C12.8619 6.24163 12.2104 6.10449 11.4473 6.10449H7.46094ZM11.0381 7.85156C11.4492 7.85158 11.7899 7.91249 12.0596 8.03418C12.3325 8.1526 12.5345 8.32743 12.666 8.55762C12.8008 8.78783 12.8682 9.07085 12.8682 9.40625C12.8681 9.73818 12.8007 10.0157 12.666 10.2393C12.5345 10.4629 12.3341 10.6313 12.0645 10.7432C11.7947 10.855 11.4557 10.9111 11.0479 10.9111H9.59668V7.85156H11.0381Z" fill="#10B981" />
              </svg>
            </>}
            color="green"
            currency={true}
          />
          <MetricCard
            title="Gift Cards Redeemed"
            value={dashboardData?.metrics?.redemption?.fullyRedeemed?.toLocaleString() || '0'}
            subtitle={`${dashboardData?.metrics?.redemption?.redemptionRate || 0}% redemption rate`}
            icon={<>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.0411 9.22318C20.2867 9.08338 20.4912 8.88134 20.634 8.63738C20.7767 8.39342 20.8527 8.11615 20.8542 7.83351V5.49967C20.8537 5.07437 20.6845 4.66663 20.3838 4.36589C20.083 4.06516 19.6753 3.89599 19.25 3.89551H2.75C2.3247 3.89599 1.91696 4.06516 1.61622 4.36589C1.31549 4.66663 1.14632 5.07437 1.14584 5.49967V7.83351C1.14734 8.11615 1.22328 8.39342 1.36602 8.63738C1.50876 8.88134 1.71326 9.08338 1.95892 9.22318C2.26954 9.4043 2.52726 9.66369 2.70637 9.97548C2.88548 10.2873 2.97974 10.6406 2.97974 11.0001C2.97974 11.3597 2.88548 11.713 2.70637 12.0248C2.52726 12.3366 2.26954 12.596 1.95892 12.7771C1.71339 12.9168 1.50898 13.1187 1.36625 13.3625C1.22352 13.6063 1.1475 13.8834 1.14584 14.1658V16.4997C1.14632 16.925 1.31549 17.3327 1.61622 17.6335C1.91696 17.9342 2.3247 18.1034 2.75 18.1038H19.25C19.6753 18.1034 20.083 17.9342 20.3838 17.6335C20.6845 17.3327 20.8537 16.925 20.8542 16.4997V14.1658C20.8527 13.8832 20.7767 13.6059 20.634 13.362C20.4912 13.118 20.2867 12.916 20.0411 12.7762C19.7305 12.595 19.4727 12.3357 19.2936 12.0239C19.1145 11.7121 19.0203 11.3588 19.0203 10.9992C19.0203 10.6396 19.1145 10.2864 19.2936 9.97456C19.4727 9.66278 19.7305 9.40339 20.0411 9.22226V9.22318ZM14.5008 10.4093L13.2376 11.6734C13.1902 11.7208 13.1558 11.7796 13.1378 11.8442C13.1198 11.9087 13.1188 11.9769 13.1349 12.0419L13.6941 14.2777C13.7124 14.3515 13.7086 14.4292 13.6832 14.5009C13.6578 14.5726 13.6118 14.6353 13.5511 14.6812C13.4904 14.7271 13.4176 14.7541 13.3416 14.759C13.2657 14.7638 13.19 14.7463 13.1239 14.7085L11.1925 13.6048C11.1339 13.5714 11.0675 13.5538 11 13.5538C10.9325 13.5538 10.8661 13.5714 10.8075 13.6048L8.87609 14.7094C8.80995 14.7473 8.73413 14.7649 8.65807 14.76C8.58201 14.7551 8.50906 14.728 8.4483 14.682C8.38753 14.636 8.34164 14.5731 8.31633 14.5012C8.29101 14.4294 8.28739 14.3516 8.30592 14.2777L8.86509 12.0419C8.88129 11.9769 8.88035 11.9087 8.86236 11.8441C8.84436 11.7795 8.80993 11.7207 8.76242 11.6734L7.49925 10.4084C7.44514 10.354 7.40834 10.2848 7.3935 10.2095C7.37866 10.1342 7.38643 10.0563 7.41584 9.98538C7.44524 9.91451 7.49497 9.85393 7.55875 9.81127C7.62254 9.76861 7.69752 9.74579 7.77425 9.74567H9.49484C9.57095 9.74572 9.6454 9.72342 9.70895 9.68155C9.7725 9.63967 9.82236 9.58005 9.85234 9.51009L10.6425 7.66392C10.6724 7.59386 10.7222 7.53412 10.7858 7.49213C10.8493 7.45014 10.9238 7.42776 11 7.42776C11.0762 7.42776 11.1507 7.45014 11.2142 7.49213C11.2778 7.53412 11.3276 7.59386 11.3575 7.66392L12.1486 9.51009C12.1786 9.58005 12.2284 9.63967 12.292 9.68155C12.3555 9.72342 12.43 9.74572 12.5061 9.74567H14.2258C14.3027 9.74561 14.3779 9.76836 14.4419 9.81107C14.5058 9.85377 14.5557 9.9145 14.5852 9.98556C14.6146 10.0566 14.6223 10.1348 14.6073 10.2103C14.5922 10.2857 14.5552 10.355 14.5008 10.4093Z" fill="#9810FA" />
              </svg>
            </>}
            color="purple"
          />
          <MetricCard
            title="Pending Settlements"
            value={dashboardData?.metrics?.settlements?.pending?.amount?.toLocaleString() || '0'}
            subtitle={`${dashboardData?.metrics?.settlements?.pending?.count || 0} settlements pending`}
            trend={dashboardData?.metrics?.settlements?.pending?.changeRate}
            trendLabel={pendingComparisonText}
            showTrend={true}
            icon={<>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1736_871)">
                  <path d="M11 0.956055C9.01358 0.956055 7.07178 1.54509 5.42014 2.64869C3.7685 3.75228 2.4812 5.32085 1.72103 7.15606C0.960864 8.99126 0.76197 11.0107 1.1495 12.9589C1.53703 14.9072 2.49358 16.6967 3.89818 18.1013C5.30279 19.5059 7.09236 20.4625 9.04061 20.85C10.9889 21.2376 13.0083 21.0387 14.8435 20.2785C16.6787 19.5183 18.2472 18.231 19.3508 16.5794C20.4544 14.9277 21.0435 12.9859 21.0435 10.9995C21.0407 8.33667 19.9817 5.78366 18.0988 3.90073C16.2159 2.01781 13.6629 0.958782 11 0.956055ZM14.6362 14.6358C14.4914 14.7805 14.295 14.8617 14.0903 14.8617C13.8856 14.8617 13.6892 14.7805 13.5443 14.6358L10.454 11.5455C10.3091 11.4007 10.2276 11.2044 10.2274 10.9995V4.81893C10.2274 4.61403 10.3088 4.41752 10.4537 4.27264C10.5986 4.12775 10.7951 4.04636 11 4.04636C11.2049 4.04636 11.4014 4.12775 11.5463 4.27264C11.6912 4.41752 11.7726 4.61403 11.7726 4.81893V10.6802L14.6362 13.5439C14.7809 13.6887 14.8622 13.8851 14.8622 14.0898C14.8622 14.2946 14.7809 14.4909 14.6362 14.6358Z" fill="#F55101" />
                </g>
                <defs>
                  <clipPath id="clip0_1736_871">
                    <rect width="22" height="22" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </>}
            color="orange"
            currency={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <ChartCard
            title="Monthly Transaction Trends"
            subtitle={monthlyData.length > 0 ? "Transaction volume over recent months" : "Awaiting first transaction data"}
            className="lg:col-span-1"
          >
            <div className="h-80 flex items-center justify-center">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        if (name === 'transactions') return [`R${value.toLocaleString()}`, 'Revenue'];
                        return [value, name];
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="transactions"
                      stroke="#3B82F6"
                      fill="url(#gradient1)"
                      strokeWidth={3}
                    />
                    <defs>
                      <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-400">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No transaction data yet</p>
                  <p className="text-sm">Charts will appear once orders are submitted</p>
                </div>
              )}
            </div>
          </ChartCard>

          <ChartCard
            title="Top Performing Brands"
            subtitle={brandData.length > 0 ? "Based on total revenue" : "Awaiting brand performance data"}
            className="lg:col-span-1"
          >
            <div className="h-80 flex items-center justify-center">
              {brandData.length > 0 ? (
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={brandData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {brandData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `R${value.toLocaleString()}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {brandData.map((brand, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: brand.color }}
                          />
                          <span className="text-sm font-medium text-gray-700">{brand.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900">R{brand.value.toLocaleString()}</span>
                          <span className="text-xs text-gray-500 ml-2">({brand.orderCount} orders)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No brand performance data yet</p>
                  <p className="text-sm">Rankings will appear once orders are submitted</p>
                </div>
              )}
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="bg-linear-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Active Brand Partners</h3>
                <p className="text-indigo-100">Brands available for selection</p>
              </div>
            </div>
            <div className="text-4xl font-bold mb-2">
              {dashboardData?.metrics?.activeBrandPartners?.active || '0'}
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="text-sm">
                {dashboardData?.metrics?.activeBrandPartners?.featured || 0} featured partnerships
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Weekly Performance</h3>
              <p className="text-sm text-gray-500">
                Transaction volume over the past week
                {dashboardData?.trends?.weekly?.summary?.weekOverWeekGrowth && (
                  <span className={`ml-2 font-medium ${dashboardData.trends.weekly.summary.weekOverWeekGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    ({dashboardData.trends.weekly.summary.weekOverWeekGrowth >= 0 ? '+' : ''}
                    {dashboardData.trends.weekly.summary.weekOverWeekGrowth}% vs last week)
                  </span>
                )}
              </p>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => {
                      if (name === 'value') return [`R${value.toLocaleString()}`, 'Revenue'];
                      return [value, name];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 6 }}
                    activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
