import BrandManager from './BrandManager';
import { Suspense } from 'react';
import { Loader } from 'lucide-react';
import { getBrandPartner } from '../../../lib/action/brandPartner';
import CustomDropdown from '../../../components/ui/CustomDropdown';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-2 text-gray-600">
        <Loader className="animate-spin" size={20} />
        Loading brands...
      </div>
    </div>
  );
}

async function BrandsPartnerContent({ searchParams }) {
  // Await searchParams in Next.js 15+
  const params = await searchParams;
  
  const queryParams = {
    page: params?.page || 1,
    limit: params?.limit || 12,
    search: params?.search || '',
    category: params?.category || 'All Brands',
    isActive: params?.isActive || null,
    isFeature: params?.isFeature || null,
    sortBy: params?.sortBy || 'createdAt',
    sortOrder: params?.sortOrder || 'desc'
  };

  const result = await getBrandPartner(queryParams);

  return (
    <BrandManager
      initialBrands={result.success ? result.data : []}
      initialPagination={result.pagination}
      initialStatistics={result.statistics}
      initialCategoryStats={result.categoryStats || []}
      searchParams={params || {}}
    />
  );
}

export default function BrandManagerPage({ searchParams }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BrandsPartnerContent searchParams={searchParams} />
    </Suspense>
  );
}
