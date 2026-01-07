import React, { Suspense } from 'react';
import Header from '../../components/client/home/Header';
import HeroSection from '../../components/client/home/HeroSection';
import ProcessSection from '../../components/client/home/ProcessSection';
import OccasionsSection from '../../components/client/home/OccasionsSection';
import BrandsSection from '../../components/client/home/BrandsSection';
import TestimonialsSection from '../../components/client/home/TestimonialsSection';
import ActionsSection from '../../components/client/home/ActionsSection';
import Features from '../../components/client/home/Features';
import Footer from '../../components/client/home/Footer';
import BulkGiftingBanner from "../../components/client/home/BulkGiftingBanner"
import { getBrands } from '../../lib/action/brandFetch';
import { getOccasions } from '@/lib/action/occasionAction';

// Create async component for occasions
async function OccasionsContent() {
  const occasions = await getOccasions({ isActive: true, limit: 8, page: 1,sortOrder:"desc" });
  
  return (
    <OccasionsSection 
      title="Celebrate Every Day"
      subtitle="Because any day is a good day to make someone smile."
      occasions={occasions?.data}
    />
  );
}

export default async function Home() {
  const brands = await getBrands();

  const brandsData = {
    title: "Featured Brands You'll Love",
    subtitle: "Curated partners, ready for your next gift.",
    brands: brands
  };
  
  return (
    <div className="min-h-screen">
      <Header/>
      <HeroSection/>
      <Features/>
      <ProcessSection />
      
      {/* Wrap OccasionsSection with Suspense and skeleton fallback */}
      <Suspense fallback={<OccasionsSection isLoading={true} />}>
        <OccasionsContent />
      </Suspense>
      
      <BrandsSection {...brandsData} />
      <TestimonialsSection />
      <BulkGiftingBanner/>
      <ActionsSection />
      <Footer/>
    </div>
  );
}