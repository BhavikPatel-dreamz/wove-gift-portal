
const Newsletter = ({ 
  title = "Stay in the loop",
  subtitle = "Get the latest on gifting from Wave.",
  placeholder = "yourname@yourcompany.com",
  buttonText = "Subscribe"
}) => {
  return (
    <div className="py-16 px-6 bg-wave-cream-dark">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-2xl font-bold text-wave-green mb-2">
          {title}
        </h3>
        <p className="text-wave-brown mb-8">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input 
            type="email" 
            placeholder={placeholder}
            className="flex-1 px-4 py-3 rounded-full border-2 border-wave-cream focus:outline-none focus:border-wave-orange bg-white text-wave-green"
          />
          <button className="btn-primary rounded-full px-6 py-3">
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;