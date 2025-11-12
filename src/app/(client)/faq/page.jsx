import React from 'react'
import FAQComponent from '../../../components/client/faq/FAQComponent'
import Header from '../../../components/client/home/Header';
import Footer from '../../../components/client/home/Footer';
import { Mail } from 'lucide-react';
import { Phone } from 'lucide-react';

const page = () => {

  const headerData = {
    logo: "Wove Gifts",
    navigation: ["Home", "About", "FAQ", "Send Gift Card", "Brands"],
    userActions: ["EN", "Login", "Register", "Artists"]
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
    <div>
      <Header {...headerData} />
      <FAQComponent />
      <Footer {...footerData} />
    </div>
  )
}

export default page