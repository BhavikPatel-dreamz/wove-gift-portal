import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Skip auth for public routes (signup & login)
  if (
    pathname.startsWith('/api/auth/signup') ||
    pathname.startsWith('/api/auth/login')||
     pathname.startsWith('/api/auth/logout')
  ) {
    return NextResponse.next()
  }

  // Require token for other API routes
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'], // applies to all API routes
}
