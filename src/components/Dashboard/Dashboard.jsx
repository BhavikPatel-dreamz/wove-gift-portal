import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Gift, DollarSign, CreditCard, Clock, TrendingUp, Users, Award, Package, AlertCircle, Loader2 } from 'lucide-react';

const Dashboard = ({ shopParam }) => {
  const [timeRange, setTimeRange] = useState('all');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`/api/dashboard?period=${timeRange}${shopParam ? `&shop=${shopParam}` : ''}`);
      
      const response = await fetch(`/api/dashboard?period=${timeRange}${shopParam ? `&shop=${shopParam}` : ''}`);

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();

      if (data.success) {
        setDashboardData(data);
      } else {
        throw new Error(data.message || 'Failed to load data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          {trend !== null && trend !== undefined && (
            <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2 text-center">Error Loading Dashboard</h3>
          <p className="text-red-700 text-center mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Transform data for charts
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

  const hasData = dashboardData?.metrics?.giftCards?.totalIssued > 0;




  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gift Card Analytics</h1>
            <p className="text-gray-600">Monitor your gift card performance and transactions</p>
          </div>
          {/* <div className="flex gap-2">
            {['all', 'month', 'quarter', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range === 'all' ? 'All Time' : range}
              </button>
            ))}
          </div> */}
        </div>

        {/* Top Metrics */}
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Monthly Transaction Trends */}
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

          {/* Top Performing Brands */}
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

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Active Brand Partners */}
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

          {/* Weekly Trend */}
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

        {/* Getting Started Section - Show only if no data */}
        {!hasData && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="max-w-3xl">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Getting Started</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 font-medium mb-2">No gift orders have been submitted yet</p>
                <p className="text-blue-700 text-sm">Start your gift card journey by creating your first order</p>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Once users start submitting gift orders through the frontend, you'll see real-time data and analytics here.
                All metrics, charts, and performance data will automatically populate based on actual user activity.
              </p>
              <div className="flex gap-4">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Create First Order
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;