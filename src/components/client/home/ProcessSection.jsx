import React from 'react';

import MessageIcon from '@/icons/MessageIcon';
import SendIcon from '@/icons/SendIcon';

import StartIcon from '@/icons/StartIcon';
import SparklesIcon from '@/icons/SparklesIcon';

const ProcessSection = () => {
  const steps = [
    {
      icon: StartIcon,
      title: "Pick a Brand",
      description: "Choose from 1000+ Brands",
      gradient: "process-icon-pink",
      cardClass: "process-card-1",
    },
    {
      icon: SparklesIcon,
      title: "Choose a Design",
      description: "Select the perfect card design",
      gradient: "process-icon-orange",
      cardClass: "process-card-2",
    },
    {
      icon: MessageIcon,
      title: "Add a Message",
      description: "Write something heartfelt",
      gradient: "process-icon-red",
      cardClass: "process-card-3",
    },
    {
      icon: SendIcon,
      title: "Send Instantly",
      description: "WhatsApp, Email, or Print",
      gradient: "process-icon-coral",
      cardClass: "process-card-4",
    },
  ];
  
  return (
    <section className="process-section">
      <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="process-section-title fontPoppins ">Gifting Made Simple</h2>
          <p className="process-section-subtitle">From selection to delivery in just a few taps</p>
        </div>

        {/* Process Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className={`process-step-card ${step.cardClass}`}>
                
                {/* Icon */}
                <div className={`process-step-icon-wrapper ${step.gradient}`}>
                  <IconComponent size={32} color="white" strokeWidth={2.5} />
                </div>

                {/* Title */}
                <h3 className={`process-step-title fontPoppins ${step.titleClass}`}>
                  {step.title}
                </h3>

                {/* Description */}
                <p className={`process-step-description ${step.descClass}`}>
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;