// BrandLogo.jsx
const BrandLogo = ({ brandName, logo, website, categorieName }) => (
  <a
    href={website}
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl shadow hover:shadow-md transition"
  >
    <img
      src={logo}
      alt={brandName}
      className="h-16 object-contain mb-3"
    />
    <h3 className="text-sm font-semibold text-gray-900 text-center">
      {brandName}
    </h3>
    <p className="text-xs text-gray-500">{categorieName}</p>
  </a>
);

export default BrandLogo;
