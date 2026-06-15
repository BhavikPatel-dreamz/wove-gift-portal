import { Inter, Poppins } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter', // This creates the CSS variable
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

const shopifyApiKey =
  process.env.NEXT_PUBLIC_SHOPIFY_API_KEY ||
  process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID ||
  process.env.SHOPIFY_API_KEY ||
  process.env.SHOPIFY_CLIENT_ID ||
  ''

export const metadata = {
  title: 'Wove Gift Cards',
  description: 'WoveGifts is a trading name of My Perks (Pty) Ltd, a private company duly incorporated in the Republic of South Africa ("My Perks", "WoveGifts", "we", "us", or "our").',
  ...(shopifyApiKey ? { other: { 'shopify-api-key': shopifyApiKey } } : {}),
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body
        className="bg-gray-50 text-gray-900"
        suppressHydrationWarning
      >
        <Script
          src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
          strategy="beforeInteractive"
        />
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
