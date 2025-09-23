"use client"
import { useState } from "react";
import OccasionCard from "./OccasionCard";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";


const OccasionsSection = ({ occasions = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(occasions.length / itemsPerPage);
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };
  
  const getCurrentOccasions = () => {
    const start = currentIndex * itemsPerPage;
    return occasions.slice(start, start + itemsPerPage);
  };

  if (!occasions.length) {
    return (
      <section className="py-20 bg-wave-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-wave-cream rounded-2xl p-12 shadow-lg">
            <div className="w-20 h-20 bg-wave-cream-dark rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-wave-brown" />
            </div>
            <h3 className="text-xl font-semibold text-wave-green mb-2">No Occasions Available</h3>
            <p className="text-wave-brown">Check back later for amazing occasions to celebrate!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center py-20 bg-wave-cream relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-wave-orange-light rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-wave-green-light rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-wave-cream-dark rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-wave-cream px-6 py-2 rounded-full shadow-lg mb-6">
            <Sparkles className="w-5 h-5 text-wave-orange" />
            <span className="text-wave-orange font-semibold">Special Occasions</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-wave-green mb-4">
            Choose Your Perfect
            <span className="bg-gradient-to-r from-wave-orange to-wave-orange-dark bg-clip-text text-transparent"> Occasion</span>
          </h2>
          <p className="text-wave-green text-lg max-w-2xl mx-auto leading-relaxed">
            Discover the perfect way to celebrate life's special moments with our curated collection of occasions
          </p>
        </div>

        {/* Navigation Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mb-8">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-wave-cream shadow-lg hover:shadow-xl transition-all duration-300 group border border-wave-cream"
              disabled={occasions.length <= itemsPerPage}
            >
              <ChevronLeft className="w-5 h-5 text-wave-green group-hover:text-wave-orange transition-colors" />
            </button>
            
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-gradient-to-r from-wave-orange to-wave-orange-dark w-8' 
                      : 'bg-wave-cream-dark hover:bg-wave-cream'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-wave-cream shadow-lg hover:shadow-xl transition-all duration-300 group border border-wave-cream"
              disabled={occasions.length <= itemsPerPage}
            >
              <ChevronRight className="w-5 h-5 text-wave-green group-hover:text-wave-orange transition-colors" />
            </button>
          </div>
        )}

        {/* Occasions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {getCurrentOccasions().map((occasion) => (
            <OccasionCard key={occasion.id} {...occasion} />
          ))}
        </div>

        {/* Stats */}
        <div className="bg-wave-cream rounded-2xl p-8 shadow-lg border border-wave-cream">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-wave-orange mb-2">{occasions.length}</div>
              <div className="text-wave-green font-medium">Total Occasions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-wave-orange mb-2">
                {occasions.filter(o => o.isActive).length}
              </div>
              <div className="text-wave-green font-medium">Active Occasions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-wave-green mb-2">100%</div>
              <div className="text-wave-green font-medium">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OccasionsSection;