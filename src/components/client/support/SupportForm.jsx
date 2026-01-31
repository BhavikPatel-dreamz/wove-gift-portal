'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createSupportRequest } from '@/lib/action/supportAction';
import { getOrdersByUserId } from '@/lib/action/orderAction';
import { useRouter } from 'next/navigation';
import { useSession } from '@/contexts/SessionContext';

export default function SupportForm() {
  const session = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    userId: session?.user?.id || '',
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    reason: '',
    message: '',
  });
  const [showSuccessFull, setShowSuccessFull] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supportId, setSupportId] = useState('');

  // Memoized handler to prevent recreation
  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  // Fetch orders only once when user is available
  useEffect(() => {
    if (!session?.user) return;

    const fullName = `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim();
    setFormData(prev => ({
      ...prev,
      name: fullName || prev.name,
      email: session.user.email || prev.email,
    }));

    const fetchOrders = async () => {
      try {
        const result = await getOrdersByUserId(session.user.id);
        if (result.success) {
          setOrders(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };
    
    fetchOrders();
  }, [session?.user?.id, session?.user?.firstName, session?.user?.lastName, session?.user?.email]);

  const handleSubmit = useCallback(async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.reason) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await createSupportRequest(formData);
      if (result.success) {
        setSupportId(result.data.supportId);
        setShowSuccessFull(true);
      } else {
        alert(result.message || 'Failed to submit support request');
      }
    } catch (error) {
      console.error('Failed to submit support request', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData]);

  // Memoized navigation handlers
  const navigateToTrackRequest = useCallback(() => {
    router.push('/track-request');
  }, [router]);

  const navigateToHome = useCallback(() => {
    router.push('/');
  }, [router]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return formData.name && formData.email && formData.reason;
  }, [formData.name, formData.email, formData.reason]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-30 text-black">
      {!showSuccessFull ? (
        <div className="max-w-xxl w-full">
          <div className="text-center mb-8">
            <h2 className="text-[40px] font-bold text-gray-900 mb-8">
              Support Request
            </h2>
            <p className="text-base text-[#4A4A4A] max-w-163 m-auto">
              Submit a request to cancel or modify your gift voucher. Requests are reviewed based on voucher status and delivery stage.
            </p>
          </div>

          <div className="text-center space-y-4 bg-white rounded-3xl p-8 max-w-xl m-auto" style={{ boxShadow: '0px 0px 60px 0px #0000000F' }}>
            <input
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Your Name"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
              required
            />

            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Your Email"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
              required
            />

            <input
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter Phone / WhatsApp"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
            />

            <select
              id="orderNumber"
              value={formData.orderNumber}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-gray-600"
            >
              <option value="">Select Voucher / Order Number</option>
              {orders.map((order) => (
                <option key={order.id} value={order.orderNumber}>
                  {order.orderNumber}
                </option>
              ))}
            </select>

            <select
              id="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-gray-600"
              required
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
              disabled={loading || !isFormValid}
              className="w-full py-3.5 bg-linear-to-r from-pink-500 to-orange-500 text-white rounded-full font-semibold shadow-lg hover:from-pink-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Send support request"
            >
              {loading ? 'Sending...' : 'Send Request ▸'}
            </button>

            <button
              onClick={navigateToTrackRequest}
              className="w-full py-3.5 bg-white border-2 border-pink-500 text-pink-500 rounded-full font-semibold hover:bg-pink-50 transition cursor-pointer"
              aria-label="View all support requests"
            >
              View All Requests
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-xxl w-full">
          <div className="flex items-center justify-center px-4">
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Request Submitted Successfully
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Your request has been received. Your request id is
                <span className="font-semibold text-gray-900"> {supportId}</span>.
                Our support team will review it and contact you within
                <span className="font-semibold"> 24–48 hours</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  className="inline-flex items-center justify-center gap-2 
             px-6 py-3 rounded-full
             border border-pink-400
             text-pink-500 font-semibold text-sm
             hover:bg-pink-50 transition cursor-pointer"
                  onClick={navigateToTrackRequest}
                  aria-label="Track request status"
                >
                  Track Request Status
                  <span>▶</span>
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2
             px-6 py-3 rounded-full
            bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)]
     
             text-white font-semibold text-sm
             shadow-lg
             hover:opacity-90 transition cursor-pointer"
                  onClick={navigateToHome}
                  aria-label="Return to home page"
                >
                  Back to Home
                  <span>▶</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}