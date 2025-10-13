
import React from 'react';
import { Gift, MessageSquare, CheckCircle, Mail, Phone } from 'lucide-react';
import Header from '../../components/client/home/Header';
import HeroSection from '../../components/client/home/HeroSection';
import ProcessSection from '../../components/client/home/ProcessSection';
import OccasionsSection from '../../components/client/home/OccasionsSection';
import BrandsSection from '../../components/client/home/BrandsSection';
import TestimonialsSection from '../../components/client/home/TestimonialsSection';
import ActionsSection from '../../components/client/home/ActionsSection';
import Features from '../../components/client/home/Features';
import Footer from '../../components/client/home/Footer';

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
    title: "Gifts From Brands People Love",
    subtitle: "Give the gift of choice with brands you know and trust.",
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
      <ActionsSection />
      <Footer/>
    </div>
  );
}
