import { Star, User } from "lucide-react";


const TestimonialCard = ({ rating, text, author }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex mb-3">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
      ))}
    </div>
    <p className="text-gray-700 text-sm mb-4">{text}</p>
    <div className="flex items-center">
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
        <User className="w-4 h-4 text-gray-600" />
      </div>
      <span className="text-sm font-medium text-gray-900">{author}</span>
    </div>
  </div>
);

export default TestimonialCard;