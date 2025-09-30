import { Gift, Package, ShieldCheck, Globe } from "lucide-react";

const Features = () => {
  const features = [
    { icon: <Gift size={22} />, label: "1000+ Brands" },
    { icon: <Package size={22} />, label: "Instant Delivery" },
    { icon: <ShieldCheck size={22} />, label: "100% Secure" },
    { icon: <Globe size={22} />, label: "Global Reach" },
  ];

  return (
    <div className="features-container">
      {features.map((item, index) => (
        <div key={index} className="feature-item">
          <span className="feature-icon">{item.icon}</span>
          <span className="feature-text">{item.label}</span>
          {index < features.length - 1 && <div className="divider" />}
        </div>
      ))}
    </div>
  );
};

export default Features;
