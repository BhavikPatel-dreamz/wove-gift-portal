

const BrandLogo = ({ name, logo }) => (
  <div className="flex items-center justify-center p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
    <span className="text-2xl font-bold text-gray-400">{name}</span>
  </div>
);

export default BrandLogo;