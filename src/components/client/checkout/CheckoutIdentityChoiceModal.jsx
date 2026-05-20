'use client';

import { Gift, X } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function CheckoutIdentityChoiceModal({
  onClose,
  onContinueAsGuest,
  onSignIn,
  onSignUp,
  showGuestOption = true,
  guestUnavailableText = '',
}) {
  const handleGoogleSignIn = () => {
    const callbackUrl = typeof window !== 'undefined' ? window.location.href : '/';
    signIn('google', { callbackUrl });
  };

  return (
    <div className="w-full max-w-[380px] rounded-[30px] border border-[#E8E8F0] bg-white px-6 py-7 shadow-[0_25px_80px_rgba(15,23,42,0.16)] relative">
      {typeof onClose === 'function' && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-pink-400 text-white shadow-md">
          <Gift className="h-6 w-6" />
        </div>

        <h2 className="max-w-[240px] text-[31px] font-bold leading-[1.05] text-gray-900">
          How would you like to continue?
        </h2>

        <p className="mt-3 max-w-[230px] text-sm leading-5 text-gray-500">
          {showGuestOption
            ? 'No account needed to complete your order'
            : 'Sign in to continue with your order'}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {showGuestOption ? (
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 px-6 py-4 text-base font-semibold text-white transition hover:from-pink-600 hover:to-orange-600"
          >
            Continue as guest
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
              </svg>
            </span>
          </button>
        ) : (
          guestUnavailableText && (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {guestUnavailableText}
            </p>
          )
        )}

        <button
          type="button"
          onClick={onSignIn}
          className="w-full rounded-2xl border border-gray-200 px-6 py-4 text-base font-semibold text-gray-900 transition hover:bg-gray-50"
        >
          Sign in to account
        </button>
      </div>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-sm text-gray-400">or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 px-4 py-3.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <p className="mt-5 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSignUp}
          className="font-medium text-pink-500 transition hover:text-pink-600"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
