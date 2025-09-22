
const Newsletter = ({ 
  title = "Stay in the loop",
  subtitle = "Get the latest on gifting from Wove.",
  placeholder = "yourname@yourcompany.com",
  buttonText = "Subscribe"
}) => {
  return (
    <div className="py-16 px-6 bg-gray-50">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-8">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input 
            type="email" 
            placeholder={placeholder}
            className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-orange-300"
          />
          <button className="bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300">
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;