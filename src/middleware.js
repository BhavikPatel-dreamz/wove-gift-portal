import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname,search} = request.nextUrl

   const urlSearchParams = new URLSearchParams(search);
  const params = Object.fromEntries(urlSearchParams.entries());

  if (
    pathname.startsWith('/shopify/install') ||
    pathname.startsWith('/api/shopify/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/shopify')) {
    const token = request.cookies.get('shopify_session')?.value;
    const shop = request.nextUrl.searchParams.get('shop');
    
    // If no token or shop parameter, redirect to install
    if (!token || !shop) {
      const installUrl = new URL('/shopify/install', request.url);
      if (shop) installUrl.searchParams.set('shop', shop);
      return NextResponse.redirect(installUrl);
    }
    
    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.SHOPIFY_SECRET_KEY);
      
      // Check if token is for the correct shop
      if (decoded.shop !== shop) {
        const installUrl = new URL('/shopify/install', request.url);
        installUrl.searchParams.set('shop', shop);
        return NextResponse.redirect(installUrl);
      }
      
      // Add shop info to headers for use in pages
      const response = NextResponse.next();
      response.headers.set('x-shopify-shop', decoded.shop);
      response.headers.set('x-shopify-token', decoded.accessToken);
      return response;
      
    } catch (error) {
      console.error('Token verification failed:', error);
      const installUrl = new URL('/shopify/install', request.url);
      if (shop) installUrl.searchParams.set('shop', shop);
      return NextResponse.redirect(installUrl);
    }
  }
  // Skip auth for public routes (signup & login)
  if (
    pathname.startsWith('/api/auth/signup') ||
    pathname.startsWith('/api/auth/login')||
     pathname.startsWith('/api/auth/logout')||
     pathname.startsWith('/api/brand')||
     pathname.startsWith('/api/occasion')
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
  matcher: ['/api/:path*','/shopify/:path*','/((?!api|_next/static|_next/image|favicon.ico).*)',], // applies to all API routes
}
