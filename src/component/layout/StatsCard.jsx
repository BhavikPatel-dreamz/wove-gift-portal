

const StatsCard = ({ stat }) => {
  return (
    <div className="bg-white border-gray-200 p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          stat.trend === 'up' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {stat.change}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;