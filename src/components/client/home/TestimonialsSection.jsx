import { Star } from "lucide-react";
import TestimonialCard from "./TestimonialCard";


const TestimonialsSection = ({ title, subtitle, testimonials }) => (
 <section className="py-20 bg-wave-cream-dark">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-wave-orange text-white px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-brand">
          <Star className="w-4 h-4" />
          Customer Reviews
        </div>
        <h2 className="text-4xl font-bold text-wave-green mb-4">{title}</h2>
        <p className="text-wave-brown text-lg max-w-2xl mx-auto">{subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} />
        ))}
      </div>

      {/* Additional Trust Indicators */}
      <div className="mt-16 text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-brand">
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-wave-orange fill-current" />
              ))}
            </div>
            <div className="text-2xl font-bold text-wave-green">4.9/5</div>
            <div className="text-sm text-wave-brown">Average Rating</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-brand">
            <div className="text-2xl font-bold text-wave-green mb-1">10K+</div>
            <div className="text-sm text-wave-brown">Happy Customers</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-brand">
            <div className="text-2xl font-bold text-wave-green mb-1">50K+</div>
            <div className="text-sm text-wave-brown">Gifts Sent</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-brand">
            <div className="text-2xl font-bold text-wave-green mb-1">99%</div>
            <div className="text-sm text-wave-brown">Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-brand-lg max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-wave-green mb-3">
            Join thousands of satisfied customers
          </h3>
          <p className="text-wave-brown mb-6">
            Experience the joy of effortless gifting with Wave Gifts today
          </p>
          <button className="btn-primary shadow-brand hover:shadow-brand-lg transition-all duration-300 transform hover:scale-105">
            Send Your First Gift
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default TestimonialsSection;