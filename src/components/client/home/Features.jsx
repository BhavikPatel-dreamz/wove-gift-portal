import { Gift, Globe, Package, ShieldCheck } from "lucide-react";

const Features = () => {
  const features = [
    { icon: <Gift size={22} />, label: "1000+ Brands" },
    { icon: <Package size={22} />, label: "Instant Delivery" },
    { icon: <ShieldCheck size={22} />, label: "100% Secure" },
    { icon: <Globe size={22} />, label: "Global Reach" },
  ];

  const FeatureItem = ({ item, showDivider }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      fontWeight: '600',
      color: '#111',
      position: 'relative'
    }}>
      <span style={{
        color: '#ed457d',
        marginRight: '8px',
        display: 'flex',
        alignItems: 'center'
      }}>
        {item.icon}
      </span>
      <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
      {showDivider && (
        <div style={{
          width: '1px',
          height: '20px',
          background: '#002402',
          marginLeft: '24px'
        }} />
      )}
    </div>
  );

  return (
    <div style={{
      background: '#FFE8DA',
      padding: '12px 20px',
      borderRadius: '8px',
      fontFamily: '"Inter", sans-serif',
      overflow: 'hidden'
    }}>
      {/* Desktop View */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '3rem'
      }} className="features-desktop">
        {features.map((item, index) => (
          <FeatureItem 
            key={index} 
            item={item} 
            showDivider={index < features.length - 1} 
          />
        ))}
      </div>

      {/* Mobile View - Marquee */}
      <div style={{
        display: 'none',
        position: 'relative',
        width: '100%',
        overflow: 'hidden'
      }} className="features-mobile">
        <div style={{
          display: 'flex',
          animation: 'scroll 15s linear infinite',
          width: 'max-content'
        }}>
          {/* Render features 3 times for seamless loop */}
          {[...Array(3)].map((_, setIndex) => (
            <div key={setIndex} style={{
              display: 'flex',
              gap: '3rem',
              paddingRight: '3rem'
            }}>
              {features.map((item, index) => (
                <FeatureItem 
                  key={`${setIndex}-${index}`} 
                  item={item} 
                  showDivider={false}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        
      `}</style>
    </div>
  );
};

export default Features;