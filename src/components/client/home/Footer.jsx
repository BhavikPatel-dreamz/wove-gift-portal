

const Footer = ({ newsletter, links, social }) => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold mb-2">{newsletter.title}</h3>
        <p className="text-gray-400 text-sm mb-4">{newsletter.subtitle}</p>
        <div className="flex max-w-md mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-4 py-2 rounded-l-full text-gray-900 focus:outline-none"
          />
          <button className="bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-r-full font-medium transition-colors">
            Subscribe
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {links.map((section, index) => (
          <div key={index}>
            <h4 className="font-semibold mb-3">{section.title}</h4>
            <ul className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-800 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            {social.map((item, index) => (
              <a key={index} href="#" className="text-gray-400 hover:text-white">
                {item.icon}
              </a>
            ))}
          </div>
          <p className="text-gray-400 text-sm">© 2024 Wave Gifts. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;