import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export function proxy(request) {
  const { pathname } = request.nextUrl

  // Public routes - no authentication required
  const publicRoutes = [
    '/api/shopify/auth',
    '/api/shopify/auth/callback',
    '/api/webhooks',
    '/shopify/install',
    '/shopify/auth-required',
    '/_next',
    '/favicon',
    '/api/payment/process-card',
  ];

  // API routes that don't need Shopify auth
  const publicApiRoutes = [
    '/api/dashboard',
    '/api/analytics',
    '/api/reports/custom',
    '/api/reports/schedule',
  ];

  // Check if current path matches any public route
  if (publicRoutes.some(route => pathname.startsWith(route)) ||
      publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Handle Shopify app routes
  if (pathname.startsWith('/shopify')) {
    const shop = request.nextUrl.searchParams.get('shop');
    const host = request.nextUrl.searchParams.get('host');
    const embedded = request.nextUrl.searchParams.get('embedded');
    const session = request.nextUrl.searchParams.get('session');
    const idToken = request.nextUrl.searchParams.get('id_token');
    
    // Root /shopify route - redirect to install or dashboard based on shop param
    if (pathname === '/shopify') {
      if (!shop) {
        return NextResponse.redirect(new URL('/shopify/install', request.url));
      }
      // If shop param exists, continue (will be handled by the page)
      return NextResponse.next();
    }
    
    // Protect all other /shopify/* routes (except install and auth-required)
    if (pathname.startsWith('/shopify/') && 
        !pathname.startsWith('/shopify/install') && 
        !pathname.startsWith('/shopify/auth-required')) {
      
      // Must have shop parameter
      if (!shop) {
        return NextResponse.redirect(new URL('/shopify/auth-required', request.url));
      }
      
      // Check for embedded app authentication markers
      const hasEmbeddedAuth = host || session || idToken || embedded === '1';
      
      if (hasEmbeddedAuth) {
        // Embedded app with auth params - allow access
        const response = NextResponse.next();
        response.headers.set('x-shopify-shop', shop);
        if (host) response.headers.set('x-shopify-host', host);
        if (session) response.headers.set('x-shopify-session', session);
        if (idToken) response.headers.set('x-shopify-id-token', idToken);
        return response;
      }
      
      // Not embedded - check for session cookie
      const token = request.cookies.get('shopify_session')?.value;
      
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.SHOPIFY_SECRET_KEY);
          
          // Verify token is for the correct shop
          if (decoded.shop !== shop) {
            const installUrl = new URL('/shopify/install', request.url);
            installUrl.searchParams.set('shop', shop);
            return NextResponse.redirect(installUrl);
          }
          
          // Valid session - allow access
          const response = NextResponse.next();
          response.headers.set('x-shopify-shop', decoded.shop);
          response.headers.set('x-shopify-token', decoded.accessToken);
          return response;
          
        } catch (error) {
          console.error('Middleware - Token verification failed:', error);
          // Invalid token - redirect to install
          const installUrl = new URL('/shopify/install', request.url);
          installUrl.searchParams.set('shop', shop);
          return NextResponse.redirect(installUrl);
        }
      }

      // No authentication found - redirect to auth required
      const authRequiredUrl = new URL('/shopify/auth-required', request.url);
      authRequiredUrl.searchParams.set('shop', shop);
      return NextResponse.redirect(authRequiredUrl);
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
    pathname.startsWith('/api/shopify/shop') ||
    pathname.startsWith('/api/sync-shopify') ||
    pathname.startsWith('/api/payment/process-card') ||
    pathname.startsWith('/api/dashboard') || 
    pathname.startsWith('/api/analytics')  ||
    pathname.startsWith(`/api/reports/custom`) ||
    pathname.startsWith(`/api/reports/schedule`) ||
    pathname.startsWith('/api/save-card')
    
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