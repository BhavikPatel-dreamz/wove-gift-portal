import { Zap } from "lucide-react";
import ActionCard from "./ActionCard";


const CTASection = ({ title, subtitle, actions }) => (
  <section className="py-20 bg-wave-cream">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-wave-green text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-brand">
          <Zap className="w-4 h-4" />
          Take Action
        </div>
        <h2 className="text-4xl font-bold text-wave-green mb-4">{title}</h2>
        <p className="text-wave-brown text-lg max-w-2xl mx-auto">{subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {actions.map((action, index) => (
          <ActionCard key={index} {...action} />
        ))}
      </div>

      {/* Additional CTA Banner */}
      <div className="mt-20 bg-white rounded-3xl p-8 md:p-12 shadow-brand-lg text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-wave-green mb-4">
            Still have questions?
          </h3>
          <p className="text-wave-brown text-lg mb-8 leading-relaxed">
            Our support team is here to help you every step of the way. Get in touch and we'll help you find the perfect gifting solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-wave-orange hover:bg-wave-orange-dark text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-brand hover:shadow-brand-lg transform hover:scale-105">
              Contact Support
            </button>
            <button className="text-wave-green hover:text-wave-orange font-semibold px-8 py-4 rounded-full border-2 border-wave-green hover:border-wave-orange transition-all duration-300">
              View FAQ
            </button>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div className="bg-white rounded-xl p-6 shadow-brand">
          <div className="text-2xl font-bold text-wave-orange mb-1">24/7</div>
          <div className="text-sm text-wave-brown">Support Available</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-brand">
          <div className="text-2xl font-bold text-wave-orange mb-1">100+</div>
          <div className="text-sm text-wave-brown">Trusted Brands</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-brand">
          <div className="text-2xl font-bold text-wave-orange mb-1">Instant</div>
          <div className="text-sm text-wave-brown">Delivery</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-brand">
          <div className="text-2xl font-bold text-wave-orange mb-1">Secure</div>
          <div className="text-sm text-wave-brown">Payments</div>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;