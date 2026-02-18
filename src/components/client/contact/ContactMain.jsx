import React, { useState } from 'react';
import { Send } from 'lucide-react';

const ContactMain = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setStatus({ type: '', message: '' });
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'Failed to send message.');
      }

      setStatus({ type: 'success', message: result.message });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error?.message || 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-173 m-auto pt-18.75 px-4 sm:px-6 lg:px-8 pb-20 text-black">
      <div className="max-w-7xl mx-auto mt-15">
        {/* Header */}
        <div className="text-center mb-5 x sm:mb-16">
          <h1 className="text-3xl font-bold text-gray-900 my-4 px-4">
            Get In Touch
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Have a question or want to work together? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-[30px] ">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

                <div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all resize-none"
                    placeholder="Tell us more about your inquiry..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)] text-white py-3 sm:py-4 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                {status.message && (
                  <p
                    className={`text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}`}
                    role="status"
                  >
                    {status.message}
                  </p>
                )}

              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactMain;
