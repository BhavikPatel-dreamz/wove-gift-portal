import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Gift, DollarSign, CreditCard, Clock, TrendingUp, Users, Award, Package } from 'lucide-react';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');

  // Sample data for charts
  const monthlyData = [
    { month: 'Jan', transactions: 45, revenue: 12500 },
    { month: 'Feb', transactions: 52, revenue: 15200 },
    { month: 'Mar', transactions: 38, revenue: 9800 },
    { month: 'Apr', transactions: 65, revenue: 18500 },
    { month: 'May', transactions: 72, revenue: 21000 },
    { month: 'Jun', transactions: 58, revenue: 16800 }
  ];

  const brandData = [
    { name: 'Amazon', value: 28, color: '#FF9500' },
    { name: 'Apple', value: 22, color: '#007AFF' },
    { name: 'Google', value: 18, color: '#34C759' },
    { name: 'Netflix', value: 15, color: '#FF3B30' },
    { name: 'Spotify', value: 17, color: '#30D158' }
  ];

  const trendData = [
    { day: 'Mon', value: 820 },
    { day: 'Tue', value: 950 },
    { day: 'Wed', value: 760 },
    { day: 'Thu', value: 1200 },
    { day: 'Fri', value: 1350 },
    { day: 'Sat', value: 1100 },
    { day: 'Sun', value: 890 }
  ];

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = "blue" }) => {
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
          {trend && <span className="text-sm font-medium">+{trend}%</span>}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gift Card Analytics</h1>
            <p className="text-gray-600">Monitor your gift card performance and transactions</p>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Gift Cards Issued"
            value="0"
            subtitle="Total vouchers created"
            icon={Gift}
            color="blue"
          />
          <MetricCard
            title="Total Value Issued"
            value="R0"
            subtitle="Value of all issued vouchers"
            icon={DollarSign}
            color="green"
          />
          <MetricCard
            title="Gift Cards Redeemed"
            value="0"
            subtitle="Vouchers marked as used"
            icon={CreditCard}
            color="purple"
          />
          <MetricCard
            title="Pending Settlements"
            value="R0"
            subtitle="Redeemed but not settled"
            icon={Clock}
            trend={12}
            color="orange"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Monthly Transaction Trends */}
          <ChartCard
            title="Monthly Transaction Trends"
            subtitle="Awaiting first transaction data"
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
                      className="text-xs"
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      className="text-xs"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
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
            subtitle="Awaiting brand performance data"
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
                      <Tooltip />
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
                        <span className="text-sm text-gray-500">{brand.value}%</span>
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
            <div className="text-4xl font-bold mb-2">9</div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="text-sm">Premium partnerships</span>
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Weekly Performance</h3>
              <p className="text-sm text-gray-500">Transaction volume over the past week</p>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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

        {/* Getting Started Section */}
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

      </div>
    </div>
  );
};

export default Dashboard;