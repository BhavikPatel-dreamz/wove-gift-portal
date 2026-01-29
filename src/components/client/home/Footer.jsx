import { Instagram, Facebook, Linkedin } from "lucide-react";

const Footer = () => {
  const links = [
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/work" },
    { name: "Brands", path: "/gift" },
    { name: "Reviews", path: "/reviews" }
  ];

  const links2 = [
    { name: "Terms & Conditions", path: "/termsandcondition" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "FAQs / Help Center", path: "/faq" },
    { name: "Contact Us", path: "/contact" }
  ];

  return (
    <>    <footer className="bg-[background: linear-gradient(180deg, #FEF8F6 0%, #FDF7F8 100%)] text-gray-800 pt-16 pb-[90px] px-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-12 mb-12"
        >
          {/* Branding Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="font-bold text-pink-500 text-xl">Wove Gifts</h3>
            </div>

            <h4 className="font-semibold text-[#1A1A1A] text-[18px] fontPoppins">
              South Africa's #1 Gift Card Platform
            </h4>

            <p className="text-gray-600 text-sm leading-relaxed">
              Making gifting magical, one card at a time
            </p>

            <div className="flex gap-3 pt-4">
              {[
                { Icon: Instagram, href: "#" },
                { Icon: Facebook, href: "#" },
                {
                  Icon: () => (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ), href: "#"
                },
                { Icon: Linkedin, href: "#" }
              ].map(({ Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:border-pink-400 hover:text-pink-500 transition-all duration-300"
                  aria-label="Social media link"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-[#1A1A1A] mb-6 text-[16px] tracking-wide uppercase">
              QUICK LINKS
            </h4>

            <ul className="space-y-4">
              {links.map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.path}
                    className="text-[#4A4A4A] text-[16px] hover:text-pink-500 transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>


          {/* Legal & Support */}
          <div>
            <h4 className="font-bold text-[#1A1A1A] mb-6 text-[16px] tracking-wide uppercase">
              LEGAL & SUPPORT
            </h4>
            <ul className="space-y-4">
              {links2.map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.path}
                    className="text-[#4A4A4A] text-[16px] hover:text-pink-500 transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-[#1A1A1A] mb-4 text-[16px] tracking-wide uppercase">
              STAY IN THE LOOP
            </h4>
            <p className="text-[#4A4A4A] text-[16px] font-medium mb-5 leading-relaxed">
              Get updates and special gifting moments
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your mail"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
              />
              <button className="bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 w-fit">
                Subscribe
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
      </div>
    </footer>
      <div className="py-8 border-t border-gray-200 text-center">
        <p className="text-gray-600 text-sm">
          © 2025 Wove Gift. All rights reserved.
        </p>
      </div>
    </>

  );
};

export default Footer;