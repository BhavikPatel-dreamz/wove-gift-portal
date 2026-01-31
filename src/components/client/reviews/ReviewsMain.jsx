import React, { useState } from 'react'
import { Star } from 'lucide-react'

const ReviewsMain = () => {
  const [filter, setFilter] = useState('all')

  const reviews = [
    {
      id: 1,
      name: 'Sarah Johnson',
      rating: 5,
      date: '2 days ago',
      comment: 'Absolutely fantastic experience! The quality exceeded my expectations and the customer service was top-notch. Will definitely be ordering again.',
      helpful: 24,
      image: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: 2,
      name: 'Michael Chen',
      rating: 4,
      date: '1 week ago',
      comment: 'Great product overall. Delivery was fast and packaging was secure. Only minor issue was the color was slightly different from the pictures, but still satisfied.',
      helpful: 18,
      image: 'https://i.pravatar.cc/150?img=3'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      rating: 5,
      date: '1 week ago',
      comment: 'Love it! Perfect fit and exactly what I was looking for. The attention to detail is impressive.',
      helpful: 31,
      image: 'https://i.pravatar.cc/150?img=5'
    },
    {
      id: 4,
      name: 'David Thompson',
      rating: 3,
      date: '2 weeks ago',
      comment: 'It\'s okay. Does the job but nothing special. Expected a bit more for the price point.',
      helpful: 9,
      image: 'https://i.pravatar.cc/150?img=7'
    },
    {
      id: 5,
      name: 'Jessica Martinez',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Outstanding quality! Been using it for a week now and it\'s held up perfectly. Highly recommend to anyone considering this purchase.',
      helpful: 42,
      image: 'https://i.pravatar.cc/150?img=9'
    },
    {
      id: 6,
      name: 'Robert Kim',
      rating: 4,
      date: '3 weeks ago',
      comment: 'Very good product. Installation was straightforward and it works as advertised. Would have given 5 stars but shipping took longer than expected.',
      helpful: 15,
      image: 'https://i.pravatar.cc/150?img=12'
    }
  ]

  const stats = {
    average: 4.5,
    total: 156,
    distribution: {
      5: 98,
      4: 32,
      3: 15,
      2: 7,
      1: 4
    }
  }

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(filter))

  const StarRating = ({ rating, size = 'w-5 h-5' }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )

  return (
    <div className='max-w-360 m-auto pt-18 px-6 pb-12'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>Customer Reviews</h1>
          <p className='text-gray-600'>See what our customers are saying about us</p>
        </div>

        {/* Stats Section */}
        <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
          <div className='grid md:grid-cols-2 gap-8'>
            {/* Average Rating */}
            <div className='flex flex-col items-center justify-center border-r border-gray-200'>
              <div className='text-6xl font-bold text-gray-900 mb-2'>{stats.average}</div>
              <StarRating rating={Math.round(stats.average)} size="w-6 h-6" />
              <p className='text-gray-600 mt-2'>Based on {stats.total} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className='space-y-2'>
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className='flex items-center gap-3'>
                  <span className='text-sm font-medium text-gray-700 w-8'>{star} ★</span>
                  <div className='flex-1 bg-gray-200 rounded-full h-3 overflow-hidden'>
                    <div
                      className='bg-yellow-400 h-full rounded-full transition-all'
                      style={{ width: `${(stats.distribution[star] / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className='text-sm text-gray-600 w-12 text-right'>
                    {stats.distribution[star]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className='flex gap-2 mb-6 flex-wrap'>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Reviews
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => setFilter(star.toString())}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                filter === star.toString()
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {star} ★
            </button>
          ))}
        </div>

        {/* Reviews List */}
        <div className='space-y-4'>
          {filteredReviews.map((review) => (
            <div key={review.id} className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow'>
              <div className='flex items-start gap-4'>
                {/* Avatar */}
                <img
                  src={review.image}
                  alt={review.name}
                  className='w-12 h-12 rounded-full object-cover'
                />
                
                {/* Content */}
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-2'>
                    <div>
                      <h3 className='font-semibold text-gray-900'>{review.name}</h3>
                      <p className='text-sm text-gray-500'>{review.date}</p>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  
                  <p className='text-gray-700 mb-3 leading-relaxed'>{review.comment}</p>
                  
                  <button className='text-sm text-gray-600 hover:text-blue-600 transition-colors'>
                    👍 Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No reviews message */}
        {filteredReviews.length === 0 && (
          <div className='text-center py-12 bg-white rounded-xl shadow-md'>
            <p className='text-gray-500 text-lg'>No reviews found for this rating.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewsMain