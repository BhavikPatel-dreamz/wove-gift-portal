"use client";

import { useState } from "react";

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

  const socialLinks = [
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M10.9987 8.021C10.2086 8.021 9.45081 8.33487 8.89211 8.89357C8.33341 9.45228 8.01953 10.21 8.01953 11.0002C8.01953 11.7903 8.33341 12.548 8.89211 13.1068C9.45081 13.6655 10.2086 13.9793 10.9987 13.9793C11.7888 13.9793 12.5466 13.6655 13.1053 13.1068C13.664 12.548 13.9779 11.7903 13.9779 11.0002C13.9779 10.21 13.664 9.45228 13.1053 8.89357C12.5466 8.33487 11.7888 8.021 10.9987 8.021Z" fill="#1A1A1A" />
        <path fillRule="evenodd" clipRule="evenodd" d="M5.87926 2.2823C9.2827 1.9059 12.7174 1.9059 16.1208 2.2823C17.9801 2.48953 19.4792 3.95086 19.6975 5.81394C20.1008 9.25924 20.1008 12.7397 19.6975 16.185C19.4792 18.0481 17.9801 19.5094 16.1218 19.7176C12.718 20.0941 9.28302 20.0941 5.87926 19.7176C4.01992 19.5094 2.5209 18.0481 2.30256 16.186C1.89915 12.7404 1.89915 9.25957 2.30256 5.81394C2.5209 3.95086 4.01992 2.48953 5.87926 2.2823ZM15.8956 5.13459C15.6359 5.13459 15.3869 5.23758 15.2033 5.42089C15.0196 5.6042 14.9165 5.85283 14.9165 6.11207C14.9165 6.37132 15.0196 6.61994 15.2033 6.80326C15.3869 6.98657 15.6359 7.08956 15.8956 7.08956C16.1553 7.08956 16.4043 6.98657 16.5879 6.80326C16.7716 6.61994 16.8747 6.37132 16.8747 6.11207C16.8747 5.85283 16.7716 5.6042 16.5879 5.42089C16.4043 5.23758 16.1553 5.13459 15.8956 5.13459ZM6.34924 10.9995C6.34924 9.76807 6.83923 8.5871 7.71142 7.71636C8.58361 6.84562 9.76656 6.35644 11 6.35644C12.2335 6.35644 13.4164 6.84562 14.2886 7.71636C15.1608 8.5871 15.6508 9.76807 15.6508 10.9995C15.6508 12.2309 15.1608 13.4119 14.2886 14.2826C13.4164 15.1533 12.2335 15.6425 11 15.6425C9.76656 15.6425 8.58361 15.1533 7.71142 14.2826C6.83923 13.4119 6.34924 12.2309 6.34924 10.9995Z" fill="#1A1A1A" />
      </svg>,
      url: "https://instagram.com/yourprofile",
      label: "Instagram",
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M20.1654 11.0002C20.1654 5.94016 16.0587 1.8335 10.9987 1.8335C5.9387 1.8335 1.83203 5.94016 1.83203 11.0002C1.83203 15.4368 4.98536 19.131 9.16536 19.9835V13.7502H7.33203V11.0002H9.16536V8.7085C9.16536 6.93933 10.6045 5.50016 12.3737 5.50016H14.6654V8.25016H12.832C12.3279 8.25016 11.9154 8.66266 11.9154 9.16683V11.0002H14.6654V13.7502H11.9154V20.121C16.5445 19.6627 20.1654 15.7577 20.1654 11.0002Z" fill="#1A1A1A" />
      </svg>,
      url: "https://facebook.com/yourprofile",
      label: "Facebook",
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M18.7431 2.00001H3.31205C3.13953 1.99922 2.96856 2.03246 2.80902 2.09781C2.64947 2.16316 2.50452 2.25933 2.38252 2.38076C2.26053 2.50219 2.16391 2.64648 2.09826 2.80529C2.03261 2.9641 1.99922 3.13428 2.00001 3.30601V18.694C2.00001 19.39 2.5827 20 3.31205 20H18.6828C18.8554 20.0009 19.0265 19.9678 19.1862 19.9025C19.3458 19.8372 19.4909 19.741 19.613 19.6196C19.7351 19.4981 19.8318 19.3538 19.8975 19.1949C19.9632 19.0361 19.9967 18.8658 19.9959 18.694V3.27701C20.0551 2.58101 19.4714 2.00001 18.7431 2.00001ZM7.33758 17.3H4.68437V8.735H7.33859L7.33758 17.3ZM5.99641 7.545C5.79312 7.54607 5.59164 7.50698 5.40363 7.43C5.21562 7.35302 5.04482 7.23968 4.90112 7.09655C4.75741 6.95341 4.64366 6.78333 4.56645 6.59613C4.48924 6.40894 4.4501 6.20836 4.4513 6.00601C4.4513 5.16501 5.15052 4.46801 5.99641 4.46801C6.8423 4.46801 7.54353 5.16501 7.54353 6.00601C7.54353 6.84701 6.90057 7.545 5.99641 7.545ZM17.4009 17.3H14.7467V13.148C14.7467 12.161 14.7176 10.855 13.3472 10.855C11.9468 10.855 11.7429 11.958 11.7429 13.061V17.3H9.08864V8.735H11.6846V9.925H11.7137C12.0925 9.229 12.9394 8.532 14.2514 8.532C16.9639 8.532 17.4592 10.274 17.4592 12.655V17.3H17.4009Z" fill="#1A1A1A" />
      </svg>,
      url: "https://linkedin.com/in/yourprofile",
      label: "LinkedIn",
    },
  ];

  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const currentYear = new Date().getFullYear();

  const handleSubscribe = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const email = subscriberEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setFeedback({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setFeedback({ type: "", message: "" });
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Subscription failed.");
      }

      setSubscriberEmail("");
      setFeedback({
        type: "success",
        message: result.message,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error?.message || "Unable to subscribe right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>    <footer className="bg-linear-to-b from-[#FEF8F6] to-[#FDF7F8] text-gray-800 pt-16 pb-20 px-6">
      <div className="max-w-360 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-12 mb-12"
        >
          {/* Branding Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-pink-400 to-orange-400 flex items-center justify-center shadow-md">
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
              {socialLinks.map(({ icon, url, label }, index) => (
                <div key={index} className="w-10 h-10 bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)]
                 flex items-center justify-center 
                 hover:border-pink-400 hover:text-pink-500 
                 transition-all duration-300 rounded-[10px]">
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9.25 h-9.25 rounded-[10px] bg-white
                 flex items-center justify-center 
                 "
                  >
                   
                      <span className="w-5 h-5">
                        {icon}
                      </span>
                   
                  </a>

                </div>
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
              Get updates, special gifting moments, and announcements
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input
                type="email"
                value={subscriberEmail}
                onChange={(event) => setSubscriberEmail(event.target.value)}
                placeholder="Enter your email"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 w-fit cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              {feedback.message && (
                <p
                  className={`text-sm ${feedback.type === "success" ? "text-green-600" : "text-red-500"}`}
                  role="status"
                >
                  {feedback.message}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Copyright */}
      </div>
    </footer>
      <div className="py-6 border-t border-gray-200 text-center bg-linear-to-b from-[#FEF8F6] to-[#FDF7F8]">
        <p className="text-gray-600 text-sm">
          © {currentYear} Wove Gift. All rights reserved.
        </p>
      </div>
    </>

  );
};

export default Footer;
