import GiftIcon from "@/icons/GiftIcon";
import GlobeIcon from "@/icons/GlobeIcon";
import PackageIcon from "@/icons/PackageIcon";
import ShieldCheckIcon from "@/icons/ShieldCheckIcon";

const Features = () => {
  const features = [
    { icon: <GiftIcon size={22} />, label: "1000+ Brands" },
    { icon: <PackageIcon size={22} />, label: "Instant Delivery" },
    { icon: <ShieldCheckIcon size={22} />, label: "100% Secure" },
    { icon: <GlobeIcon size={22} />, label: "Global Reach" },
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
