"use client"
import { useState } from 'react';
import { Search } from 'lucide-react';

const FAQComponent = () => {
  const [activeCategory, setActiveCategory] = useState('Getting Started');
  const [expandedKey, setExpandedKey] = useState('Getting Started::What is Wove Gifts?');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEmailSupportOpen, setIsEmailSupportOpen] = useState(false);
  const [supportFormData, setSupportFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSupportSubmitting, setIsSupportSubmitting] = useState(false);
  const [supportStatus, setSupportStatus] = useState({ type: '', message: '' });

  const categories = [
    { name: 'Getting Started', color: 'bg-gradient-to-r from-pink-500 to-orange-400' },
    { name: 'Countries and Brands' },
    { name: 'Buying a Gift Card (Individual)', color: 'bg-white' },
    { name: 'Bulk Gifting', color: 'bg-white' },
    { name: 'Personalization & Delivery', color: 'bg-white' },
    { name: 'Redemption & Voucher Details', color: 'bg-white' },
    { name: 'Orders, Changes & Refunds', color: 'bg-white' },
    { name: 'Payments & Security', color: 'bg-white' },
    { name: 'Technical Issues', color: 'bg-white' }
  ];
  const faqData = {
    'Getting Started': [
      {
        question: 'What is Wove Gifts?',
        answer: 'Wove is a digital gifting platform where you can send branded gift vouchers through WhatsApp, email, or printable format.'
      },
      {
        question: 'How does gifting work on Wove?',
        answer: 'Choose a brand, set the amount, personalize your gift, select delivery, review details, and complete payment.'
      },
      {
        question: 'Do I need an account to send gifts?',
        answer: 'You can browse and build gifts without an account. Signing in helps with order history, status tracking, and faster repeat gifting.'
      },
      {
        question: 'Can I send both individual and bulk gifts?',
        answer: 'Yes. Wove supports individual gifting and a dedicated bulk flow for team rewards, campaigns, and client gifting.'
      }
    ],
    'Countries and Brands': [
      {
        question: 'How do I find a brand?',
        answer: 'Use the search bar and category filter in the brand selection step to quickly find matching partners.'
      },
      {
        question: 'Can I filter the brand list?',
        answer: 'Yes. You can search by keyword and filter by category to narrow down available brands.'
      },
      {
        question: 'Are amounts the same for every brand?',
        answer: 'Amount options depend on the brand and voucher setup. You will see available values during the amount selection steps.'
      }
    ],
    'Buying a Gift Card (Individual)': [
      {
        question: 'What are the individual gifting steps?',
        answer: 'Brand Selection → Gift Amount → Occasion → Category → Your Message → Timing → Delivery Method → Review & Confirm → Payment.'
      },
      {
        question: 'Can I schedule a gift for later?',
        answer: 'Yes. In the timing step, choose immediate delivery or schedule a specific date and time.'
      },
      {
        question: 'Which delivery methods are available?',
        answer: 'For individual gifts, you can send via WhatsApp, Email, or Print It Yourself.'
      },
      {
        question: 'Can I edit details before paying?',
        answer: 'Yes. Before payment, you can go back to earlier steps or use the review screen to edit your selections.'
      }
    ],
    'Bulk Gifting': [
      {
        question: 'How do I start a bulk order?',
        answer: 'Open bulk mode from the gift flow, pick a brand, then set amount and quantity for your order.'
      },
      {
        question: 'Can I upload recipients in bulk?',
        answer: 'Yes. Upload CSV or Excel with required columns: name and email (phone and message are optional).'
      },
      {
        question: 'Are there upload limits for bulk files?',
        answer: 'Yes. A bulk upload supports up to 1000 recipients per file, and recipient count must match your selected voucher quantity.'
      },
      {
        question: 'How are bulk vouchers delivered?',
        answer: 'You can receive all voucher codes to your contact email, or upload recipients for individual email delivery.'
      }
    ],
    'Personalization & Delivery': [
      {
        question: 'Can I add a personal message?',
        answer: 'Yes. During the message step, add a custom note to personalize each gift.'
      },
      {
        question: 'What does "Print It Yourself" mean?',
        answer: 'This delivery method lets you generate a printable gift voucher file you can download and hand over personally.'
      },
      {
        question: 'What details are required for delivery?',
        answer: 'Requirements depend on method. WhatsApp needs names and phone numbers; Email needs sender and recipient names/emails.'
      },
      {
        question: 'When does delivery happen?',
        answer: 'Immediate gifts are sent after successful payment. Scheduled gifts are sent on your selected date and time.'
      }
    ],
    'Redemption & Voucher Details': [
      {
        question: 'How does the recipient redeem a gift?',
        answer: 'Recipients use the voucher code or redemption link delivered through WhatsApp/email and complete redemption with the selected brand.'
      },
      {
        question: 'Can I check voucher code and status later?',
        answer: 'Yes. Use My Gifts to view code details, delivery info, and voucher status for your purchases.'
      },
      {
        question: 'Can a voucher have remaining balance after partial use?',
        answer: 'Some vouchers support partial redemption. When applicable, remaining balance and redemption history appear in gift details.'
      },
      {
        question: 'Do vouchers expire?',
        answer: 'Voucher validity depends on brand rules. Expiry information is included with voucher details.'
      }
    ],
    'Orders, Changes & Refunds': [
      {
        question: 'Where can I track my gifts?',
        answer: 'Open My Gifts to track All, Sent, Received, and Expired gifts, and use search/date filters for quick lookup.'
      },
      {
        question: 'Can I change recipient info after payment?',
        answer: 'Before payment, you can edit from review flow. After payment, modifications are limited; contact support immediately for help.'
      },
      {
        question: 'Can I cancel an order after payment?',
        answer: 'In-app flow treats paid voucher orders as final once processed. If you need urgent help, contact support with your order details.'
      },
      {
        question: 'Are refunds available?',
        answer: 'Digital voucher refunds are generally limited once issued. Support can review failed, duplicate, or technical issue cases.'
      }
    ],
    'Payments & Security': [
      {
        question: 'Which payment method is currently available?',
        answer: 'Payments are processed through PayFast in the current checkout flow.'
      },
      {
        question: 'Is payment secure?',
        answer: 'Yes. Payment is handled through encrypted processing and secure checkout workflows.'
      },
      {
        question: 'When are voucher codes generated?',
        answer: 'Voucher codes are generated after payment confirmation and then sent through your selected delivery path.'
      }
    ],
    'Technical Issues': [
      {
        question: 'I did not receive the gift email or WhatsApp. What should I do?',
        answer: 'Check spam/junk folders, verify recipient details, and confirm order status in My Gifts. Then contact support if still not received.'
      },
      {
        question: 'My bulk file upload failed. Why?',
        answer: 'Ensure file type is CSV/XLSX, include required columns (name, email), avoid duplicate/invalid emails, and match recipient count to quantity.'
      },
      {
        question: 'Payment succeeded but order is not visible yet.',
        answer: 'Processing can take a short time after payment confirmation. Refresh My Gifts, then contact support if it still does not appear.'
      },
      {
        question: 'How can I contact support quickly?',
        answer: 'Use the support options below (email or WhatsApp) and share your order number so the team can assist faster.'
      }
    ]
  };

  const buildFaqKey = (category, question) => `${category}::${question}`;

  const toggleExpand = (faqKey) => {
    setExpandedKey((prev) => (prev === faqKey ? null : faqKey));
  };

  const handleSupportInputChange = (e) => {
    const { name, value } = e.target;
    setSupportFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailSupportSubmit = async (e) => {
    e.preventDefault();

    if (isSupportSubmitting) {
      return;
    }

    setSupportStatus({ type: '', message: '' });
    setIsSupportSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(supportFormData)
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'Failed to send message.');
      }

      setSupportStatus({ type: 'success', message: result.message });
      setSupportFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSupportStatus({
        type: 'error',
        message: error?.message || 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSupportSubmitting(false);
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  // Search globally across all categories when a term is provided.
  const displayFaqs = normalizedSearch
    ? Object.entries(faqData).flatMap(([category, faqs]) =>
      faqs
        .map((faq) => ({
          ...faq,
          _category: category,
          _key: buildFaqKey(category, faq.question)
        }))
        .filter(
          (faq) =>
            faq.question.toLowerCase().includes(normalizedSearch) ||
            faq.answer.toLowerCase().includes(normalizedSearch)
        )
    )
    : (faqData[activeCategory] || []).map((faq) => ({
      ...faq,
      _category: activeCategory,
      _key: buildFaqKey(activeCategory, faq.question)
    }));

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Hero Section */}
      <div
        className="p-6 sm:p-10 py-25 sm:py-30"
        style={{
          borderRadius: '0 0 30px 30px',
          background: 'linear-gradient(126.43deg, #FBDCE3 31.7%, #FDE6DB 87.04%)'
        }}
      >
        <h1 className="text-center text-xl sm:text-[40px] md:text-[40px] font-bold text-[#1A1A1A] px-4">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 sm:mt-5 text-center text-sm sm:text-[16px] text-[#4A4A4A] max-w-xl mx-auto px-4">
          Find answers to common questions about Wove Gifts, from getting started to bulk orders and everything in between.
        </p>
      </div>

      {/* Search Bar */}
      <div className="absolute left-1/2 -translate-x-1/2 -mt-4
                w-[90%] sm:w-[80%] md:w-130
                h-auto px-2 sm:px-4">
        <div className="relative">
          {/* Search icon */}
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2
                 w-9 h-9 sm:w-10 sm:h-10
                 bg-[rgba(217,217,217,0.2)]
                 rounded-full flex items-center justify-center z-10"
          >
            <Search
              className="w-4 h-4 sm:w-5 sm:h-5 text-black"
              strokeWidth={2}
            />
          </div>

          {/* Input */}
          <input
            type="text"
            placeholder="Search FAQs (e.g., refund, WhatsApp, bulk CSV)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
        w-full
        pl-12 sm:pl-14
        pr-4
        py-2.5 sm:py-3.5
        rounded-full
        text-sm sm:text-[15px]
        shadow-sm
        focus:outline-none
        border-2 border-[#FFB4B4]
        bg-white text-black
      "
          />
        </div>
      </div>

      <div className="min-h-screen bg-white">
        {/* Category Pills */}
        <div className="px-4 mt-5">
          <div className="max-w-5xl mx-auto py-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={`px-6 py-2.5 cursor-pointer rounded-full font-medium transition-all duration-200 text-base ${activeCategory === category.name
                    ? 'bg-linear-to-r from-pink-500 to-orange-400 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto px-4 pb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-center mb-6 sm:mb-8 text-gray-900 px-4">
            {normalizedSearch
              ? `Search Results (${displayFaqs.length})`
              : activeCategory}
          </h1>


          {/* FAQ Items */}
          <div className="space-y-3 sm:space-y-4 mb-10 sm:mb-16">
            {displayFaqs.length > 0 ? (
              displayFaqs.map((faq) => {
                const isExpanded = expandedKey === faq._key;

                return (
                  <div
                    key={faq._key}
                    className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 transition-colors duration-200 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(faq._key)}
                      className="w-full cursor-pointer p-4 sm:p-6 flex justify-between items-start gap-3 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="text-left pr-2 sm:pr-4">
                        {normalizedSearch && (
                          <span className="inline-flex items-center mb-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF3ED] text-[#E65A3A]">
                            {faq._category}
                          </span>
                        )}
                        <span className="block font-semibold text-gray-900 text-base sm:text-lg">
                          {faq.question}
                        </span>
                      </div>

                      <div className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center relative transition-transform duration-200 cursor-pointer">
                        {isExpanded ? (
                          <div className="cursor-pointer w-4 sm:w-5 h-0.5 bg-[#FFB4B4]" />
                        ) : (
                          <>
                            <div className="absolute w-4 sm:w-5 h-0.5 bg-[#FFB4B4]" />
                            <div className="absolute w-0.5 h-4 sm:h-5 bg-[#FFB4B4]" />
                          </>
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-600">
                No FAQs matched your search. Try a different keyword.
              </div>
            )}
          </div>
        </div>

        {/* Support Contact Section */}
        <div className="max-w-5xl mx-auto px-4 pb-14 sm:pb-20">
          <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl p-px bg-linear-to-r from-pink-500 to-orange-400">
            <div className="rounded-2xl sm:rounded-3xl bg-linear-to-br from-pink-50 to-orange-50 p-6 sm:p-10 lg:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Didn't find what you need?
              </h2>

              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-xl mx-auto px-2">
                Our support team is here to help. Reach out through your preferred channel or check your order history.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setSupportStatus({ type: '', message: '' });
                    setIsEmailSupportOpen(true);
                  }}
                  className="cursor-pointer bg-linear-to-r from-pink-500 to-orange-400 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold hover:shadow-lg transition-shadow duration-200 flex items-center justify-center gap-2"
                >
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.666 4.33337H4.33268C3.14102 4.33337 2.16602 5.30837 2.16602 6.50004V19.5C2.16602 20.6917 3.14102 21.6667 4.33268 21.6667H21.666C22.8577 21.6667 23.8327 20.6917 23.8327 19.5V6.50004C23.8327 5.30837 22.8577 4.33337 21.666 4.33337ZM21.2327 8.93754L14.1477 13.3684C13.4435 13.8125 12.5552 13.8125 11.851 13.3684L4.76602 8.93754C4.65739 8.87656 4.56226 8.79417 4.4864 8.69537C4.41053 8.59656 4.3555 8.48338 4.32464 8.36269C4.29378 8.242 4.28773 8.1163 4.30685 7.99321C4.32598 7.87011 4.36988 7.75217 4.4359 7.64653C4.50193 7.54089 4.5887 7.44975 4.69097 7.37862C4.79324 7.30749 4.90888 7.25784 5.03089 7.2327C5.1529 7.20755 5.27874 7.20742 5.4008 7.23232C5.52286 7.25721 5.6386 7.30662 5.74102 7.37754L12.9993 11.9167L20.2577 7.37754C20.3601 7.30662 20.4758 7.25721 20.5979 7.23232C20.72 7.20742 20.8458 7.20755 20.9678 7.2327C21.0898 7.25784 21.2055 7.30749 21.3077 7.37862C21.41 7.44975 21.4968 7.54089 21.5628 7.64653C21.6288 7.75217 21.6727 7.87011 21.6918 7.99321C21.711 8.1163 21.7049 8.242 21.6741 8.36269C21.6432 8.48338 21.5882 8.59656 21.5123 8.69537C21.4364 8.79417 21.3413 8.87656 21.2327 8.93754Z" fill="white" />
                  </svg>
                  Email Support
                </button>

                <button type="button" className="cursor-pointer bg-green-500 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold hover:shadow-lg transition-shadow duration-200 flex items-center justify-center gap-2">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_1187_1600)">
                      <path fillRule="evenodd" clipRule="evenodd" d="M13.6264 12.2858C13.21 12.456 12.944 13.1078 12.6742 13.4408C12.5358 13.6114 12.3708 13.638 12.1581 13.5525C10.5954 12.9299 9.39739 11.8871 8.535 10.4489C8.38891 10.2259 8.41512 10.0497 8.59129 9.84261C8.85168 9.53581 9.1791 9.18733 9.24957 8.77397C9.40598 7.8596 8.21059 5.02323 6.63192 6.30843C2.08926 10.0102 14.2099 19.8281 16.3974 14.518C17.0162 13.0128 14.3164 12.0031 13.6264 12.2858ZM11.0001 20.0782C9.39352 20.0782 7.8127 19.6511 6.42868 18.8424C6.20653 18.7122 5.93797 18.6778 5.68961 18.7453L2.68223 19.5707L3.72981 17.2629C3.79987 17.1088 3.82795 16.9389 3.8112 16.7705C3.79445 16.6021 3.73346 16.4411 3.63442 16.3038C2.51379 14.7505 1.92125 12.9166 1.92125 10.9998C1.92125 5.99347 5.99383 1.92089 11.0001 1.92089C16.0064 1.92089 20.0786 5.99347 20.0786 10.9998C20.0786 16.0056 16.006 20.0782 11.0001 20.0782ZM11.0001 -0.000244141C4.93465 -0.000244141 0.000120525 4.93429 0.000120525 10.9998C0.000120525 13.1336 0.60598 15.1828 1.75711 16.9612L0.086058 20.6415C0.0105473 20.8077 -0.0160567 20.992 0.00935913 21.1729C0.034775 21.3537 0.111159 21.5235 0.229574 21.6625C0.319886 21.7682 0.432021 21.853 0.558268 21.9113C0.684514 21.9695 0.821875 21.9997 0.960902 21.9998C1.58051 21.9998 4.95914 20.938 5.81895 20.7021C7.40836 21.5525 9.19114 21.9998 11.0001 21.9998C17.0652 21.9998 22.0001 17.0648 22.0001 10.9998C22.0001 4.93429 17.0652 -0.000244141 11.0001 -0.000244141Z" fill="white" />
                    </g>
                    <defs>
                      <clipPath id="clip0_1187_1600">
                        <rect width="22" height="22" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  WhatsApp Support
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {isEmailSupportOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-100 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Email Support</h3>
              <button
                type="button"
                onClick={() => setIsEmailSupportOpen(false)}
                className="w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close email support form"
              >
                x
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-5">
              Send us your query and our team will get back to you.
            </p>

            <form onSubmit={handleEmailSupportSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={supportFormData.name}
                onChange={handleSupportInputChange}
                disabled={isSupportSubmitting}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                required
              />

              <input
                type="email"
                name="email"
                value={supportFormData.email}
                onChange={handleSupportInputChange}
                disabled={isSupportSubmitting}
                placeholder="Your email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                required
              />

              <input
                type="text"
                name="subject"
                value={supportFormData.subject}
                onChange={handleSupportInputChange}
                disabled={isSupportSubmitting}
                placeholder="Subject"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                required
              />

              <textarea
                name="message"
                value={supportFormData.message}
                onChange={handleSupportInputChange}
                disabled={isSupportSubmitting}
                placeholder="Tell us how we can help..."
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none"
                required
              />

              <button
                type="submit"
                disabled={isSupportSubmitting}
                className="w-full bg-linear-to-r from-pink-500 to-orange-400 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSupportSubmitting ? 'Sending...' : 'Send Message'}
              </button>

              {supportStatus.message && (
                <p
                  className={`text-sm ${supportStatus.type === 'success' ? 'text-green-600' : 'text-red-500'}`}
                  role="status"
                >
                  {supportStatus.message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQComponent;
