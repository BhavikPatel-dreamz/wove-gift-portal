import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react"; // assuming appropriate icons

const Footer = () => {
  return (
    <footer className="bg-[#FFF5F5] text-black py-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Branding + Social */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md bg-gradient-to-r from-pink-500 to-orange-400 flex items-center justify-center">
                {/* Assuming Gift icon or custom logo */}
                <span aria-label="gift" className="text-white font-bold text-xl">🎁</span>
              </div>
              <h3 className="font-bold text-pink-600 text-lg">Wove Gifts</h3>
            </div>
            <p className="font-semibold mb-1 text-base">South Africa's #1 Gift Card Platform</p>
            <p className="text-gray-600 mb-6">Making gifting magical, one card at a time</p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter, Linkedin].map((Icon, idx) => (
                <a 
                  href="#"
                  key={idx}
                  aria-label="Social Link"
                  className="social-icon"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-black mb-4 text-sm tracking-wider uppercase">Quick Links</h4>
            <ul className="space-y-3 text-gray-800 text-sm">
              {["Home", "How It Works", "Brands", "Reviews"].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="hover:text-pink-600 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="font-bold text-black mb-4 text-sm tracking-wider uppercase">Legal & Support</h4>
            <ul className="space-y-3 text-gray-800 text-sm">
              {["Terms & Conditions", "Privacy Policy", "FAQs / Help Center", "Contact Us"].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="hover:text-pink-600 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-black mb-3 text-sm tracking-wider uppercase">Stay in the Loop</h4>
            <p className="text-gray-600 mb-3">Get updates and special gifting moments</p>
            <form className="flex gap-4">
              <input
                type="email"
                placeholder="Enter your mail"
                className="input-rounded"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="btn-gradient text-white px-5 rounded-full font-semibold flex items-center gap-1"
              >
                Subscribe <span>▶</span>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-600 text-sm">
          © 2025 Wove Gift. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;