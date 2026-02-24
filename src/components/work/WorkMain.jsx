import React from 'react'
import {
  BadgeDollarSign,
  MessageSquareHeart,
  Send,
  ShieldCheck,
  Store
} from 'lucide-react'

const WorkMain = () => {
  const steps = [
    {
      icon: <Store className="w-6 h-6" />,
      title: "Choose Brand",
      description: "Select your preferred brand from trusted partners."
    },
    {
      icon: <BadgeDollarSign className="w-6 h-6" />,
      title: "Set Amount",
      description: "Pick a gift card value that fits your budget."
    },
    {
      icon: <MessageSquareHeart className="w-6 h-6" />,
      title: "Personalize",
      description: "Choose occasion/category and add your message."
    },
    {
      icon: <Send className="w-6 h-6" />,
      title: "Delivery Setup",
      description: "Set timing and delivery method, or configure bulk flow."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Review & Pay",
      description: "Confirm details and complete secure payment."
    }
  ]

  return (
    <div className='max-w-360 m-auto pt-18 px-4 sm:px-6 lg:px-8'>
      {/* Hero Section */}
      <div className='text-center py-12 sm:py-16'>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 my-4">
          How It Works
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          A simple 5-step flow to send thoughtful gift cards quickly.
        </p>
      </div>

      {/* Steps Section */}
      <div className='relative mb-20'>
        <div className='pointer-events-none absolute inset-x-0 -top-6 h-36 bg-linear-to-r from-[#FFE6D4]/70 via-[#FDEDF5]/70 to-[#FFF4DA]/70 blur-3xl' />
        <div className='relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 auto-rows-fr gap-5 lg:gap-6'>
          {steps.map((step, index) => (
            <div key={index} className='relative h-full'>
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className='hidden xl:block absolute top-12 left-[62%] w-full h-px bg-linear-to-r from-[#F8B28D] via-[#ED457D] to-[#FA8F42] opacity-40' />
              )}

              <div className='group relative z-10 h-full min-h-[250px] rounded-2xl border border-[#F3DDD3] bg-white p-6 shadow-[0_10px_28px_rgba(20,20,20,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(20,20,20,0.12)] flex flex-col'>
                <div className='flex items-center justify-between mb-5'>
                  <span className='inline-flex items-center px-3 h-7 rounded-full bg-[#FFF3ED] text-[#E65A3A] text-xs font-bold tracking-wide'>
                    STEP {index + 1}
                  </span>
                  <div className='bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)] text-white rounded-xl w-12 h-12 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105'>
                    {step.icon}
                  </div>
              </div>

                <h3 className='text-lg font-bold mb-2 text-gray-900 leading-snug'>
                  {step.title}
                </h3>
                <p className='text-gray-600 leading-relaxed text-sm sm:text-base'>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

     

      {/* CTA Section */}
      {/* <div className='text-center py-16 bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)] rounded-3xl mb-20'>
        <h2 className='text-4xl font-bold text-white mb-6'>
          Ready to Get Started?
        </h2>
        <p className='text-xl text-blue-100 mb-8 max-w-2xl m-auto'>
          Join thousands of teams already using our platform to work smarter and achieve more
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
          <button className='bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg'>
            Start Free Trial
          </button>
          <button className='bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors'>
            Schedule Demo
          </button>
        </div>
      </div> */}
    </div>
  )
}

export default WorkMain
