'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordForm({ initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data?.error || 'Unable to send reset link')
        return
      }

      setMessage(
        data?.message ||
          'If an account exists for that email, a reset link has been sent.'
      )
    } catch (err) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="mx-auto max-w-md w-full bg-[#FFF9FA] rounded-3xl shadow-2xl p-8 border border-gray-100 relative">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Forgot your password?
          </h2>
          <p className="text-gray-600 text-sm">
            Enter your email and we will send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <input
              type="email"
              id="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
              placeholder="Enter email address"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-700 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`group w-full mt-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
              loading
                ? 'bg-gray-400 shadow-none cursor-not-allowed'
                : 'hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:shadow-xl hover:scale-105 cursor-pointer'
            }`}
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Remembered your password?{' '}
          <Link
            href="/login"
            className="text-pink-500 font-semibold hover:text-pink-600 transition"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
