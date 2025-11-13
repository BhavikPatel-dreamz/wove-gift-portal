import React from 'react';
import { Star, Sparkles, MessageSquare, Send } from 'lucide-react';

const ProcessSection = () => {
  const steps = [
    {
      icon: Star,
      title: "Pick a Brand",
      description: "Choose from 1000+ Brands",
      gradient: "process-icon-pink",
      cardClass: "process-card-1",
      titleClass: "",
      descClass: ""
    },
    {
      icon: Sparkles,
      title: "Choose a Design",
      description: "Select the perfect card design",
      gradient: "process-icon-orange",
      cardClass: "process-card-2",
      titleClass: "process-title-tilted",
      descClass: "process-desc-tilted"
    },
    {
      icon: MessageSquare,
      title: "Add a Message",
      description: "Write something heartfelt",
      gradient: "process-icon-red",
      cardClass: "process-card-3",
      titleClass: "",
      descClass: ""
    },
    {
      icon: Send,
      title: "send Instantly",
      description: "WhatsApp, Email, or Print",
      gradient: "process-icon-coral",
      cardClass: "process-card-4",
      titleClass: "process-title-tilted",
      descClass: "process-desc-tilted"
    }
  ];

  return (
    <section className="process-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="process-section-title fontPoppins ">Gifting Made Simple</h2>
          <p className="process-section-subtitle">From selection to delivery in just a few taps</p>
        </div>

        {/* Process Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className={`process-step-card ${step.cardClass}`}>
                
                {/* Icon */}
                <div className={`process-step-icon-wrapper ${step.gradient}`}>
                  <IconComponent size={32} color="white" strokeWidth={2.5} />
                </div>

                {/* Title */}
                <h3 className={`process-step-title ${step.titleClass}`}>
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