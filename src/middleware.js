import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request) {
  const { pathname, search } = request.nextUrl

  const urlSearchParams = new URLSearchParams(search);
  const params = Object.fromEntries(urlSearchParams.entries());

  if (
    pathname.startsWith('/shopify/install') ||
    pathname.startsWith('/api/shopify/auth') ||
    pathname.startsWith('/api/shopify/gift-cards') ||
    pathname.startsWith('/api/giftcard') ||
    pathname.startsWith('/api/shopify/shop') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/shopify')) 
    {
    const shop = request.nextUrl.searchParams.get('shop');
    const embedded = request.nextUrl.searchParams.get('embedded');
    const session = request.nextUrl.searchParams.get('session');
    const idToken = request.nextUrl.searchParams.get('id_token');
    
    // Allow access to main shopify page for shop parameter input
    if (pathname === '/shopify' && !shop) {
      return NextResponse.next();
    }
    
    // For shopify/main and other protected routes, check authentication
    if (pathname.startsWith('/shopify/main') || shop) 
    {
      console.log("Middleware - Processing Shopify route:", pathname);
      console.log("Middleware - Shop:", shop);
      console.log("Middleware - Embedded:", embedded);
      console.log("Middleware - Session param:", session);
      console.log("Middleware - ID Token present:", !!idToken);

      const token = request.cookies.get('shopify_session')?.value;
      console.log("Middleware - shopify_session cookie:", token);

      // For embedded apps, we might have session in URL params instead of cookies
      if (!token && (session || idToken)) {
        console.log("Middleware - No cookie but have URL session/token, allowing through");
        const response = NextResponse.next();
        if (shop) response.headers.set('x-shopify-shop', shop);
        if (session) response.headers.set('x-shopify-session', session);
        if (idToken) response.headers.set('x-shopify-id-token', idToken);
        return response;
      }

      // If we have a cookie token, verify it
      if (token && shop) {
        try {
          const decoded = jwt.verify(token, process.env.SHOPIFY_SECRET_KEY);
          
          // Check if token is for the correct shop
          if (decoded.shop !== shop) {
            console.log("Middleware - Shop mismatch, redirecting to install");
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
          console.error('Middleware - Token verification failed:', error);
          // For embedded apps, don't redirect if we have URL params
          if (session || idToken) {
            console.log("Middleware - Token verification failed but have URL session, allowing through");
            const response = NextResponse.next();
            if (shop) response.headers.set('x-shopify-shop', shop);
            return response;
          }
          
          const installUrl = new URL('/shopify/install', request.url);
          if (shop) installUrl.searchParams.set('shop', shop);
          return NextResponse.redirect(installUrl);
        }
      }

      // No authentication found
      if (!token && !session && !idToken) {
        console.log("Middleware - No authentication found, redirecting to install");
        const installUrl = new URL('/shopify/install', request.url);
        if (shop) installUrl.searchParams.set('shop', shop);
        return NextResponse.redirect(installUrl);
      }
    }
    
    return NextResponse.next();
  }
  // Skip auth for public routes (signup & login)
  if (
    pathname.startsWith('/api/auth/signup') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/api/brand') ||
    pathname.startsWith('/api/occasion') ||
    pathname.startsWith('/api/giftcard') ||
    pathname.startsWith('/api/shopify/products') ||
    pathname.startsWith('/api/shopify/gift-cards') ||
    pathname.startsWith('/api/shopify/shop')
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
