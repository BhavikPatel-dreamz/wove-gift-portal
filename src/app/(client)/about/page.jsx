import React from 'react'
import GiftBanner from '../../../components/client/about/GiftBanner';
import WhySection from '../../../components/client/about/WhySection';
import FeaturesGrid from '../../../components/client/about/FeaturesGrid';
import HowItWorks from '../../../components/client/about/HowItWorks';
import RewardsSection from '../../../components/client/about/RewardsSection';
import Header from '../../../components/client/home/Header';
import Footer from '../../../components/client/home/Footer';

import { CheckCircle } from 'lucide-react';
import { Star } from 'lucide-react';
import { Globe } from 'lucide-react';
import { Mail } from 'lucide-react';
import { Phone } from 'lucide-react';

const page = () => {
    const customFeatures = [
        {
            icon: CheckCircle,
            title: "Trusted Brands",
            description: "Access to premium and popular brands worldwide.",
            color: "green"
        },
        {
            icon: Star,
            title: "5-Star Experience",
            description: "Delightful gifting experience every time.",
            color: "yellow"
        },
        {
            icon: Globe,
            title: "Global Reach",
            description: "Send gifts anywhere in the world instantly.",
            color: "blue"
        }
    ];

    const headerData = {
        logo: "Wave Gifts",
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
        <div className="min-h-screen bg-white">
            <Header {...headerData} />

            <GiftBanner />

            <WhySection />

            <FeaturesGrid  />

            <HowItWorks />

            <RewardsSection />

            <Footer {...footerData} />

        </div>
    );
}

export default page