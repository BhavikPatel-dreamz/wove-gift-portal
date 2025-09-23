import { Gift } from "lucide-react";


const Footer = ({ newsletter, links, social }) => (
  <footer className="bg-wave-green text-white py-12">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Newsletter Section */}
      <div className="text-center mb-12 pb-8 border-b border-wave-green-light">
        <h3 className="text-lg font-semibold mb-2">{newsletter.title}</h3>
        <p className="text-wave-cream text-sm mb-6">{newsletter.subtitle}</p>
        <div className="flex max-w-md mx-auto gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 rounded-l-full text-wave-green bg-white focus:outline-none focus:ring-2 focus:ring-wave-orange"
          />
          <button className="bg-wave-orange hover:bg-wave-orange-dark px-6 py-3 rounded-r-full font-medium transition-colors">
            Subscribe
          </button>
        </div>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {links.map((section, index) => (
          <div key={index}>
            <h4 className="font-semibold mb-4 text-white">{section.title}</h4>
            <ul className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <a href="#" className="text-wave-cream hover:text-white text-sm transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-wave-green-light pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Social Links */}
          <div className="flex items-center space-x-6 mb-4 md:mb-0">
            {social.map((item, index) => (
              <a
                key={index}
                href="#"
                className="text-wave-cream hover:text-white transition-colors duration-200"
                aria-label={item.name}
              >
                {item.icon}
              </a>
            ))}
          </div>

          {/* Brand & Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-wave-orange rounded-lg flex items-center justify-center">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">Wave Gifts</span>
            </div>
            <p className="text-wave-cream text-sm">© 2024 Wave Gifts. All rights reserved.</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6 pt-6 border-t border-wave-green-light">
          <p className="text-wave-cream text-sm">
            South Africa's #1 Gift Card Platform - Making gifting magical and smart at a time
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;