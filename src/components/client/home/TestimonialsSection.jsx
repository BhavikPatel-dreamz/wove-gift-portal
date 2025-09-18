import TestimonialCard from "./TestimonialCard";


const TestimonialsSection = ({ title, subtitle, testimonials }) => (
  <section className="py-16 bg-gray-50">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-purple-600 mb-2">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} />
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;