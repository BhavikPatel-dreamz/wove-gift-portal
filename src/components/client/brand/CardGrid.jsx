import BrandCard from "./BrandCard";


const CardGrid = ({ brands, favorites, onToggleFavorite, onBrandClick, premiumBrands = [] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {brands.map(brand => (
      <BrandCard
        key={brand.id}
        brand={brand}
        isPremium={premiumBrands.includes(brand.id)}
        isFavorited={favorites.includes(brand.id)}
        onToggleFavorite={onToggleFavorite}
        onClick={onBrandClick}
      />
    ))}
  </div>
);

export default CardGrid;