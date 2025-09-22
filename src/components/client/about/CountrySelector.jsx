import { Globe } from "lucide-react";
import { ArrowRight } from "lucide-react";


const CountrySelector = ({ 
  title = "Choose your country to see local brands and denominations.",
  countries = ["USA", "UK", "EU"]
}) => {
  return (
    <div className="py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Globe className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-lg text-gray-600 mb-8">
          {title}
        </p>
        <div className="flex justify-center gap-4 mb-8">
          {countries.map((country, index) => (
            <button 
              key={index}
              className="px-6 py-2 border-2 border-gray-200 rounded-full hover:border-orange-300 hover:bg-orange-50 transition-colors duration-300"
            >
              {country}
            </button>
          ))}
        </div>
        <button className="text-blue-500 hover:text-blue-600 font-medium flex items-center mx-auto gap-2">
          Choose Country
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CountrySelector;