
import React from 'react';
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
import { getBrands, getOccasions } from '../../lib/action/brandFetch';


export default async function Home() {
  const brands = await getBrands();
  const occasions = await getOccasions();

  const occasionsData = {
    title: "Celebrate Every Day",
    subtitle: "Because any day is a good day to make someone smile.",
    occasions: occasions
  };

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
      <OccasionsSection {...occasionsData} />
      <BrandsSection {...brandsData} />
      <TestimonialsSection />
      <BulkGiftingBanner/>
      <ActionsSection />
      <Footer/>
    </div>
  );
}
