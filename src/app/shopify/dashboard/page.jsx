'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Gift, DollarSign, CreditCard, Clock, TrendingUp, Users, Award, Package, Calendar, X } from 'lucide-react';

// Skeleton Components
const SkeletonMetricCard = ({ color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    orange: "bg-orange-50 border-orange-200"
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} animate-pulse`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
      </div>
      <div className="space-y-2">
        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
        <div className="h-8 bg-gray-400 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      </div>
    </div>
  );
};

const SkeletonChart = ({ title, subtitle }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <div className="mb-6">
      <div className="h-6 bg-gray-300 rounded w-1/3 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </div>
    <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-400">
        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-48 mx-auto"></div>
      </div>
    </div>
  </div>
);

const SkeletonActiveBrands = () => (
  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
        <div className="w-8 h-8 bg-white/30 rounded"></div>
      </div>
      <div className="flex-1">
        <div className="h-5 bg-white/30 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-white/20 rounded w-1/2"></div>
      </div>
    </div>
    <div className="h-10 bg-white/30 rounded w-20 mb-2"></div>
    <div className="h-4 bg-white/20 rounded w-40"></div>
  </div>
);

const SkeletonWeeklyPerformance = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
    <div className="mb-6">
      <div className="h-6 bg-gray-300 rounded w-1/3 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </div>
    <div className="h-40 bg-gray-100 rounded-lg animate-pulse"></div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 px-1 py-6 md:py-6 md:px-6">
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Skeleton */}
      <div className="flex flex-col items-center md:flex-row justify-between gap-4">
        <div>
          <div className="h-9 bg-gray-300 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-80 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 p-1 rounded-lg">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 w-24 bg-gray-200 rounded-md animate-pulse"></div>
              ))}
            </div>
            <div className="h-9 w-36 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonMetricCard color="blue" />
        <SkeletonMetricCard color="green" />
        <SkeletonMetricCard color="purple" />
        <SkeletonMetricCard color="orange" />
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      {/* Bottom Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonActiveBrands />
        <SkeletonWeeklyPerformance />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const searchParams = useSearchParams();
  const shop = searchParams?.get('shop');
  
  // Local state management - no URL updates
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Fetch data whenever filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          period,
          ...(shop && { shop }),
          ...(startDate && endDate && { startDate, endDate }),
        });

        const response = await fetch(`/api/dashboard?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, startDate, endDate, shop]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setStartDate('');
    setEndDate('');
    setShowCustomDatePicker(false);
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

    setPeriod('custom');
    setStartDate(customStartDate);
    setEndDate(customEndDate);
    setShowCustomDatePicker(false);
  };

  const clearCustomDates = () => {
    setCustomStartDate('');
    setCustomEndDate('');
    setStartDate('');
    setEndDate('');
    setPeriod('month');
    setShowCustomDatePicker(false);
  };

  const PeriodFilter = () => {
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
          <div className="flex items-center space-x-1 p-1 rounded-lg">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePeriodChange(p.value)}
                className={`
                  px-3 py-1.5 rounded-md transition-colors
                  font-inter text-[14px] font-semibold leading-[18px]
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
              font-inter text-[14px] font-semibold leading-[18px]
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

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = "blue", currency = false }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-600",
      green: "bg-green-50 border-green-200 text-green-600",
      purple: "bg-purple-50 border-purple-200 text-purple-600",
      orange: "bg-orange-50 border-orange-200 text-orange-600"
    };

    return (
      <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all hover:scale-105 hover:shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-3xl font-bold text-gray-900">
            {currency && 'R'}{value}
          </p>
          <p className="text-sm text-gray-600">{subtitle}</p>
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

  // Show skeleton while loading
  if (loading) {
    return <LoadingSkeleton />;
  }

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

  return (
    <div className="min-h-screen bg-gray-50 px-1 py-6 md:py-6 md:px-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col items-center md:flex-row justify-between gap-4">
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
            icon={Gift}
            trend={dashboardData?.metrics?.giftCards?.growthRate}
            color="blue"
          />
          <MetricCard
            title="Total Value Issued"
            value={dashboardData?.metrics?.giftCards?.totalValue?.toLocaleString() || '0'}
            subtitle="Value of all issued vouchers"
            icon={DollarSign}
            color="green"
            currency={true}
          />
          <MetricCard
            title="Gift Cards Redeemed"
            value={dashboardData?.metrics?.redemption?.fullyRedeemed?.toLocaleString() || '0'}
            subtitle={`${dashboardData?.metrics?.redemption?.redemptionRate || 0}% redemption rate`}
            icon={CreditCard}
            color="purple"
          />
          <MetricCard
            title="Pending Settlements"
            value={dashboardData?.metrics?.settlements?.pending?.amount?.toLocaleString() || '0'}
            subtitle={`${dashboardData?.metrics?.settlements?.pending?.count || 0} settlements pending`}
            icon={Clock}
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

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white">
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