"use client";
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setSelectedOccasion, setCurrentStep } from '@/redux/giftFlowSlice';

const OccasionsSection = ({ occasions = [] }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  if (!occasions.length) {
    return null;
  }

  const handleOccasionSelect = (occasion) => {
    dispatch(setSelectedOccasion(occasion.id));
    dispatch(setCurrentStep(4)); // Directly go to SubCategory selection
    router.push('/gift');
  };

  return (
    <section className="occasions-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="occasions-section-title">Perfect for Every Occasion</h2>
          <p className="occasions-section-subtitle">Find the right moment to spread joy</p>
        </div>

        {/* Occasions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {occasions.slice(0, 4).map((occasion) => (
            <div key={occasion.id} className="occasion-card">
              
              {/* Image */}
              {occasion.image && (
                <img 
                  src={occasion.image} 
                  alt={occasion.title}
                  className="occasion-card-image"
                />
              )}

              {/* Content */}
              <div className="occasion-card-content">
                <h3 className="occasion-card-title">{occasion.title}</h3>
                <p className="occasion-card-description">{occasion.description}</p>
                
                {/* Button */}
                <button 
                  className="occasion-card-button"
                  onClick={() => handleOccasionSelect(occasion)}
                >
                  Choose this Occasion
                  <span>▸</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OccasionsSection;