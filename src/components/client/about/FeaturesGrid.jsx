

import React from 'react';
import { Gift, Users, Zap, Heart, CheckCircle, Star, Globe, ArrowRight, Play } from 'lucide-react';


const FeaturesGrid = ({ features = [] }) => {
  const defaultFeatures = [
    {
      icon: Users,
      title: "Access to Brands",
      description: "A curated catalog of trusted favorites and global names.",
      color: "orange"
    },
    {
      icon: Zap,
      title: "Instant & Delightful",
      description: "Wow-thing, weird, or practical—delivered in moments.",
      color: "pink"
    },
    {
      icon: Heart,
      title: "For Everyone",
      description: "One gift that fits every taste, budget, and occasion.",
      color: "red"
    }
  ];

  const featuresToRender = features.length > 0 ? features : defaultFeatures;

  return (
    <div className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {featuresToRender.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className={`w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <Icon className={`w-8 h-8 text-${feature.color}-500`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturesGrid;