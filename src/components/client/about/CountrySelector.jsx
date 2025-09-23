import { Globe } from "lucide-react";
import { ArrowRight } from "lucide-react";


const CountrySelector = ({ 
  title = "Choose your country to see local brands and denominations.",
  countries = ["South Africa", "UK", "EU", "USA"]
}) => {
  return (
    <div className="py-16 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-16 h-16 bg-wave-green rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-brand">
          <Globe className="w-8 h-8 text-white" />
        </div>
        <p className="text-lg text-wave-brown mb-8">
          {title}
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {countries.map((country, index) => (
            <button 
              key={index}
              className="px-6 py-2 border-2 border-wave-cream rounded-full hover:border-wave-orange hover:bg-wave-cream transition-all duration-300 text-wave-green font-medium"
            >
              {country}
            </button>
          ))}
        </div>
        <button className="text-wave-orange hover:text-wave-orange-dark font-medium flex items-center mx-auto gap-2 transition-colors duration-300">
          Choose Country
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CountrySelector;