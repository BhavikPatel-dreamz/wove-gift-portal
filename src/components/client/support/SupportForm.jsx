'use client'

import { useState } from 'react'

export default function SupportForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    reason: '',
    message: '',
  })
  const [showSuccessFull, setShowSuccessFull] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async () => {
    setShowSuccessFull(true)
    setLoading(true)
    try {
      // API call here
      console.log(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-30">
      {
        !showSuccessFull ? (
          <div className="max-w-xxl w-full">
            <div className="text-center mb-8">
              <h2 className="text-[40px] font-bold text-gray-900 mb-[32px]">
                Support Request – Cancel or Modify Gift
              </h2>
              <p className="text-base text-[#4A4A4A] max-w-[652px] m-auto">
                Submit a request to cancel or modify your gift voucher. Requests are reviewed based on voucher status and delivery stage.
              </p>
            </div>

            {/* Form */}
            <div className="text-center space-y-4 bg-white rounded-3xl p-8 max-w-xl m-auto" style={{ boxShadow: '0px 0px 60px 0px #0000000F' }}>
              <input
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Your Name"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
              />

              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Your Email"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
              />

              <input
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter Phone / WhatsApp"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
              />

              <input
                id="orderNumber"
                value={formData.orderNumber}
                onChange={handleChange}
                placeholder="Select Voucher / Order Number"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
              />

              <select
                id="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-gray-600"
              >
                <option value="">Select Reason</option>
                <option value="cancel">Cancel Gift</option>
                <option value="modify">Modify Gift</option>
                <option value="wrong-details">Wrong Details</option>
                <option value="other">Other</option>
              </select>

              <textarea
                id="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Your Message (Optional)"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none resize-none"
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full font-semibold shadow-lg hover:from-pink-600 hover:to-orange-600 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Sending...' : 'Send Request ▸'}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-xxl w-full">
            <div class="flex items-center justify-center px-4">
              <div class="text-center space-y-6 max-w-2xl mx-auto">


                <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  Request Submitted Successfully
                </h1>


                <p class="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Your request has been received. Your request id is
                  <span class="font-semibold text-gray-900">WG-SUP-10245</span>.
                  Our support team will review it and contact you within
                  <span class="font-semibold">24–48 hours</span>.
                </p>


                <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">


                  <button
                    class="inline-flex items-center justify-center gap-2 
               px-6 py-3 rounded-full
               border border-pink-400
               text-pink-500 font-semibold text-sm
               hover:bg-pink-50 transition cursor-pointer"
                  >
                    Track Request Status
                    <span>▶</span>
                  </button>


                  <button
                    class="inline-flex items-center justify-center gap-2
               px-6 py-3 rounded-full
              bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)]
       
               text-white font-semibold text-sm
               shadow-lg
               hover:opacity-90 transition cursor-pointer"
                  >
                    Back to Home
                    <span>▶</span>
                  </button>

                </div>
              </div>
            </div>

          </div>
        )
      }


    </div>
  )
}
