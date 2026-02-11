import React from 'react'
import { Zap, Users, CheckCircle, Sparkles } from 'lucide-react'

const WorkMain = () => {
  const steps = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Choose a brand",
      description: "Filter by country to see local partners."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Personalize",
      description: "Add a note (and optional video message)."
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Send & smile",
      description: "Instant delivery; easy redemption at checkout."
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Achieve Your Goals",
      description: "Track progress, measure success, and scale."
    }
  ]

  const features = [
    "Real-time collaboration",
    "Advanced analytics",
    "Secure cloud storage",
    "24/7 customer support",
    "Mobile & desktop apps",
    "API integrations"
  ]

  return (
    <div className='max-w-360 m-auto pt-18 px-4'>
      {/* Hero Section */}
      <div className='text-center py-16'>
        <h1 className="text-3xl font-bold text-gray-900 my-4 px-4">
          How It Works
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          Get started in minutes with our simple, powerful platform designed to transform the way you work
        </p>
      </div>

      {/* Steps Section */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20'>
        {steps.map((step, index) => (
          <div key={index} className='relative'>
            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className='hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-linear-to-r from-blue-400 to-purple-400 opacity-30' />
            )}

            <div className='bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 relative z-10'>
              <div className='bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)] text-white rounded-full w-16 h-16 flex items-center justify-center mb-6'>
                {step.icon}
              </div>
              <div className='text-sm font-semibold text-black mb-2'>
                STEP {index + 1}
              </div>
              <h3 className='text-xl font-bold mb-3 text-gray-800'>
                {step.title}
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className='bg-linear-to-br from-blue-50 to-purple-50 rounded-3xl p-12 mb-20'>
        <h2 className='text-3xl font-bold text-center mb-12 text-gray-800'>
          Everything You Need to Succeed
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl m-auto'>
          {features.map((feature, index) => (
            <div key={index} className='flex items-center space-x-3 bg-white rounded-xl p-4 shadow-sm'>
              <CheckCircle className='w-6 h-6 text-green-500 shrink-0' />
              <span className='text-gray-700 font-medium'>{feature}</span>
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