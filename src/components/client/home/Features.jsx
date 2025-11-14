import { Gift, Globe, Package, ShieldCheck } from "lucide-react";

const Features = () => {
  const features = [
    { icon: <Gift size={22} />, label: "1000+ Brands" },
    { icon: <Package size={22} />, label: "Instant Delivery" },
    { icon: <ShieldCheck size={22} />, label: "100% Secure" },
    { icon: <Globe size={22} />, label: "Global Reach" },
  ];

  const FeatureItem = ({ item, showDivider }) => (
    <div className="feature-item">
      <span className="feature-icon">{item.icon}</span>
      <span className="feature-text">{item.label}</span>
      {showDivider && <div className="divider" />}
    </div>
  );

  return (
    <>
      

      <div className="features-container">
        {/* Desktop View */}
        <div className="features-desktop">
          {features.map((item, index) => (
            <FeatureItem 
              key={index} 
              item={item} 
              showDivider={index < features.length - 1} 
            />
          ))}
        </div>

        {/* Mobile View - Marquee */}
        <div className="features-mobile">
          <div className="marquee">
            <div className="marquee-content">
              {features.map((item, index) => (
                <FeatureItem 
                  key={index} 
                  item={item} 
                  showDivider={index < features.length - 1} 
                />
              ))}
            </div>
            {/* Duplicate for seamless loop */}
            <div className="marquee-content">
              {features.map((item, index) => (
                <FeatureItem 
                  key={`dup-${index}`} 
                  item={item} 
                  showDivider={index < features.length - 1} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Features;