import { Heart, Gift, CheckCircle, Star } from 'lucide-react';

const HeroSection = ({ title, subtitle, description, ctaText, stats }) => (
  <section className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-20 relative overflow-hidden">
    {/* Decorative elements */}
    <div className="absolute top-20 left-10 w-16 h-16 bg-pink-200 rounded-2xl opacity-60 transform rotate-12"></div>
    <div className="absolute top-40 right-20 w-20 h-20 bg-purple-200 rounded-2xl opacity-60 transform -rotate-12"></div>
    <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-yellow-200 rounded-full opacity-60"></div>
    
    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
        {title}
      </h1>
      <p className="text-xl text-gray-600 mb-4">
        Choose from <span className="font-semibold text-pink-600">{subtitle}</span>, personalize your card, and <span className="font-semibold text-pink-600">deliver joy instantly</span>
      </p>
      <p className="text-gray-500 mb-8">{description}</p>
      
      <button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors duration-200">
        {ctaText}
      </button>
      
      <div className="mt-8 text-sm text-gray-500">
        Available in US only - UK & US <span className="text-pink-500">Limited Kingdom</span>
      </div>
      
      <div className="flex justify-center items-center space-x-2 mt-4">
        <Gift className="w-4 h-4 text-pink-500" />
        <Heart className="w-4 h-4 text-pink-500" />
        <Star className="w-4 h-4 text-pink-500" />
      </div>
      
      <div className="flex justify-center space-x-12 mt-12 text-sm text-gray-600">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{stat}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HeroSection;