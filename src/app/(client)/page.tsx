
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

import { getBrands, getOccasions } from '../../lib/action/data';


export default async function Home() {
  const brands = await getBrands();
  const occasions = await getOccasions();

  const occasionsData = {
    title: "Perfect for Every Occasion",
    subtitle: "Find the right moment to spread joy",
    occasions: occasions
  };

  const brandsData = {
    title: "Featured Brands You'll Love",
    subtitle: "Curated partners, easy for you to give joy",
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
