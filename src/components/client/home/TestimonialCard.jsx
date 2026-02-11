import { Star, User } from "lucide-react";

const TestimonialCard = ({ rating, text, author }) => (
 <div className="bg-white p-6 rounded-xl shadow-brand hover:shadow-brand-lg transition-all duration-300 border border-wave-cream">
    <div className="flex mb-3">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 text-wave-orange fill-current" />
      ))}
      {[...Array(5 - rating)].map((_, i) => (
        <Star key={i + rating} className="w-4 h-4 text-wave-cream-dark" />
      ))}
    </div>
    <p className="text-wave-brown text-sm mb-4 leading-relaxed">{text}</p>
    <div className="flex items-center">
      <div className="w-8 h-8 bg-wave-cream rounded-full flex items-center justify-center mr-3">
        <User className="w-4 h-4 text-wave-green" />
      </div>
      <span className="text-sm font-medium text-wave-green">{author}</span>
    </div>
  </div>
);

export default TestimonialCard;