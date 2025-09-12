"use client"
const { BarChart3, ShoppingBag } = require("lucide-react");
const { default: StatsCard } = require("../layout/StatsCard");


const DashboardContent = () => {
  const stats = [
    { label: 'Total Orders', value: '2,847', change: '+12.3%', trend: 'up' },
    { label: 'Revenue', value: '$84,329', change: '+8.1%', trend: 'up' },
    { label: 'Active Brands', value: '156', change: '+2.4%', trend: 'up' },
    { label: 'Settlements', value: '$12,450', change: '-1.2%', trend: 'down' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border-gray-200 p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Revenue Overview</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <BarChart3 className="w-16 h-16 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white border-gray-200 p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New order received</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;