
import React from 'react';
import { Gift, MessageSquare, CheckCircle, Mail, Phone } from 'lucide-react';
import Header from '../../components/client/home/Header';
import HeroSection from '../../components/client/home/HeroSection';
import ProcessSection from '../../components/client/home/ProcessSection';
import OccasionsSection from '../../components/client/home/OccasionsSection';
import BrandsSection from '../../components/client/home/BrandsSection';
import TestimonialsSection from '../../components/client/home/TestimonialsSection';
import CTASection from '../../components/client/home/CTASection';
import Footer from '../../components/client/home/Footer';
import { getBrands, getOccasions } from '../../lib/action/data';


export default async function Home() {
  const brands = await getBrands();
  const occasions = await getOccasions();
 const headerData = {
    logo: "Wave Gifts",
    navigation: ["Home", "About", "FAQ", "Send Gift Card", "Brands"],
    userActions: ["EN", "Login", "Register", "Artists"]
  };

  const heroData = {
    title: "Gifts That Say Everything",
    subtitle: "1000+ brands",
    description: "WhatsApp • Email • Print • Text - get perfect gift delivered perfectly.",
    ctaText: "Start Gifting",
    stats: ["100% Brands", "Instant Delivery", "100% Secure", "24h Setup"]
  };

  const processData = {
    title: "Gifting Made Simple",
    subtitle: "From someone to delivery in just four steps",
    steps: [
      {
        icon: Gift,
        title: "Pick a Brand",
        description: "Choose from 1000+ brands across every category."
      },
      {
        icon: MessageSquare,
        title: "Choose a Design",
        description: "Add a card with message and design options to personalize it."
      },
      {
        icon: Mail,
        title: "Add a Message",
        description: "Write something heartfelt to make it extra special."
      },
      {
        icon: CheckCircle,
        title: "Send Instantly",
        description: "Whatsapp, Email, or Print - you choose the delivery method."
      }
    ]
  };

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

  console.log("brandsData",brandsData);
  

  const testimonialsData = {
    title: "Loved by Gift Senders",
    subtitle: "Real stories from real people spreading joy",
    testimonials: [
      {
        rating: 5,
        text: "The WhatsApp delivery was so smooth. My friend was so surprised when they opened the gift!",
        author: "Nikita R."
      },
      {
        rating: 5,
        text: "Best gifting experience ever. The card designs are beautiful and the delivery was instant.",
        author: "Rohit K."
      },
      {
        rating: 5,
        text: "Saved me when I forgot my anniversary. Wife was so happy and I looked like a hero! 😊",
        author: "Ravi Sharma"
      }
    ]
  };

  const ctaData = {
    title: "Choose Your Action",
    subtitle: "Browse or pick, send individual gift cards, or purchase in bulk",
    actions: [
      {
        icon: Gift,
        title: "Browse Brands",
        description: "Explore all options and see hundreds of brands to choose from.",
        buttonText: "View All Brands",
        bgColor: "bg-pink-500"
      },
      {
        icon: Mail,
        title: "Send Gift Card",
        description: "Send someone the perfect gift card with custom design and message.",
        buttonText: "Start Sending",
        bgColor: "bg-teal-500"
      },
      {
        icon: CheckCircle,
        title: "Buy in Bulk",
        description: "Purchase multiple gift cards for corporate gifts, events or bulk giving.",
        buttonText: "Bulk Orders",
        bgColor: "bg-green-500"
      }
    ]
  };

  const footerData = {
    newsletter: {
      title: "Stay in the loop",
      subtitle: "Get updates and special offers delivered directly to your inbox"
    },
    links: [
      {
        title: "Legal & Support",
        items: ["Privacy Policy", "Terms of Service", "Help", "Help Center", "Contact Us"]
      },
      {
        title: "Connect With Us",
        items: ["Facebook", "Twitter", "Instagram", "LinkedIn"]
      },
      {
        title: "Wave Gift",
        items: ["About", "Careers", "Press"]
      }
    ],
    social: [
      { icon: <Mail className="w-5 h-5" /> },
      { icon: <Phone className="w-5 h-5" /> }
    ]
  };
  

  return (
    <div className="min-h-screen">
      <Header {...headerData} />
      <HeroSection {...heroData} />
      <ProcessSection {...processData} />
      <OccasionsSection {...occasionsData} />
      <BrandsSection {...brandsData} />
      <TestimonialsSection {...testimonialsData} />
      <CTASection {...ctaData} />
      <Footer {...footerData} />
    </div>
  );
}
