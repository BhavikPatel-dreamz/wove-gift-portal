import BrandLogo from "./BrandLogo";

const BrandsSection = ({ title, subtitle, brands }) => (
  <section className="py-16 bg-white text-black">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {brands.map((brand) => (
          <BrandLogo key={brand.id} {...brand} />
        ))}
      </div>

      <div className="text-center mt-8">
        <button className="text-pink-500 hover:text-pink-600 font-medium">
          View All Brands
        </button>
      </div>
    </div>
  </section>
);

export default BrandsSection;
