import { Inter, Poppins } from 'next/font/google'
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

export const metadata = {
  title: 'Wove Gift Cards',
  description: 'Production-grade authentication with Next.js, Prisma, and PostgreSQL',
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
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}