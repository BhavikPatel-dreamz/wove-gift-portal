import { Heart, Gift, CheckCircle, Star } from 'lucide-react';

const HeroSection = ({ title, subtitle, description, ctaText, stats }) => (
  <section className="bg-wave-cream py-20 relative overflow-hidden">
    {/* Decorative elements */}
    <div className="absolute top-20 left-10 w-16 h-16 bg-wave-cream-dark rounded-2xl opacity-60 transform rotate-12"></div>
    <div className="absolute top-40 right-20 w-20 h-20 bg-wave-orange-light rounded-2xl opacity-60 transform -rotate-12"></div>
    <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-wave-green-light rounded-full opacity-60"></div>
    
    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl md:text-6xl font-bold text-wave-green mb-6">
        {title}
      </h1>
      <p className="text-xl text-wave-green mb-4">
        Choose from <span className="font-semibold text-wave-orange">{subtitle}</span>, personalize your card, and <span className="font-semibold text-wave-orange">deliver joy instantly</span>
      </p>
      <p className="text-wave-brown mb-8">{description}</p>
      
      <button className="bg-wave-orange hover:bg-wave-orange-dark text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors duration-200">
        {ctaText}
      </button>
      
      <div className="mt-8 text-sm text-wave-brown">
        Available in US only - UK & US <span className="text-wave-orange">Limited Kingdom</span>
      </div>
      
      <div className="flex justify-center items-center space-x-2 mt-4">
        <Gift className="w-4 h-4 text-wave-orange" />
        <Heart className="w-4 h-4 text-wave-orange" />
        <Star className="w-4 h-4 text-wave-orange" />
      </div>
      
      <div className="flex justify-center space-x-12 mt-12 text-sm text-wave-green">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-wave-green" />
            <span>{stat}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HeroSection;