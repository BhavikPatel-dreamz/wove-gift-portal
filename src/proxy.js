import { NextResponse } from 'next/server';
import { hasValidSession } from './lib/shopify.server.js';
import {
  ensureShopifyInstallData,
  normalizeShopDomain,
} from './lib/shopify/installBootstrap.js';

const SHOPIFY_CONTEXT_HEADERS = {
  shop: 'x-shopify-shop',
  host: 'x-shopify-host',
  embedded: 'x-shopify-embedded',
  session: 'x-shopify-session',
  id_token: 'x-shopify-id-token',
  locale: 'x-shopify-locale',
  brandId: 'x-shopify-brand-id',
};

function logTrackedRequest(request, stage, extra = {}) {
  const url = request.nextUrl;
  const trackedPaths = ['/api/webhooks/payfast', '/payment/success'];

  if (!trackedPaths.some((path) => url.pathname.startsWith(path))) {
    return;
  }

  console.log('[proxy][tracked-request]', {
    stage,
    method: request.method,
    pathname: url.pathname,
    search: url.search,
    host: request.headers.get('host'),
    origin: request.headers.get('origin'),
    referer: request.headers.get('referer'),
    userAgent: request.headers.get('user-agent'),
    hasAuthToken: Boolean(request.cookies.get('auth-token')?.value),
    ...extra,
  });
}

function withShopifyContext(request, context) {
  const headers = new Headers(request.headers);

  for (const [key, headerName] of Object.entries(SHOPIFY_CONTEXT_HEADERS)) {
    const value = context[key];

    if (value) {
      headers.set(headerName, value);
    }
  }

  return headers;
}

async function authorizeShopifyRequest(request, context) {
  const {
    normalizedShop,
    host,
    embedded,
    session,
    idToken,
    locale,
    brandId,
  } = context;

  if (!normalizedShop) {
    return NextResponse.redirect(new URL('/shopify/auth-required', request.url));
  }

  const validSession = await hasValidSession(normalizedShop);

  let bootstrapState = null;

  if (!validSession && idToken) {
    bootstrapState = await ensureShopifyInstallData({
      shop: normalizedShop,
      idToken,
    });
  }

  const hasAccess = validSession || Boolean(bootstrapState?.session?.accessToken);

  if (!hasAccess) {
    const authRequiredUrl = new URL('/shopify/auth-required', request.url);
    authRequiredUrl.searchParams.set('shop', normalizedShop);

    if (host) {
      authRequiredUrl.searchParams.set('host', host);
    }

    if (embedded) {
      authRequiredUrl.searchParams.set('embedded', embedded);
    }

    if (locale) {
      authRequiredUrl.searchParams.set('locale', locale);
    }

    if (brandId) {
      authRequiredUrl.searchParams.set('brandId', brandId);
    }

    return NextResponse.redirect(authRequiredUrl);
  }

  const requestHeaders = withShopifyContext(request, {
    shop: normalizedShop,
    host,
    embedded,
    session,
    id_token: idToken,
    locale,
    brandId,
  });

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  logTrackedRequest(request, 'incoming');

  // Public routes - no authentication required
  const publicRoutes = [
    '/api/health',
    '/api/shopify/auth',
    '/api/shopify/auth/callback',
    '/api/webhooks',
    '/api/cron',
    '/shopify/install',
    '/shopify/auth-required',
    '/_next',
    '/favicon',
    '/api/payment/process-card',
  ];

  // API routes that don't need Shopify auth
  const publicApiRoutes = [
    '/api/reports/custom',
    '/api/reports/schedule',
    '/api/shopify/webhooks',
  ];

  // Check if current path matches any public route
  if (publicRoutes.some(route => pathname.startsWith(route)) ||
      publicApiRoutes.some(route => pathname.startsWith(route))) {
    logTrackedRequest(request, 'public-route-allowed', {
      matchedPublicRoute:
        publicRoutes.find((route) => pathname.startsWith(route)) ||
        publicApiRoutes.find((route) => pathname.startsWith(route)) ||
        null,
    });
    return NextResponse.next();
  }

  // Handle Shopify app routes
  if (pathname.startsWith('/shopify')) {
    const shop = request.nextUrl.searchParams.get('shop');
    const normalizedShop = shop ? normalizeShopDomain(shop) : '';
    const host = request.nextUrl.searchParams.get('host');
    const embedded = request.nextUrl.searchParams.get('embedded');
    const session = request.nextUrl.searchParams.get('session');
    const idToken =
      request.nextUrl.searchParams.get('id_token') ||
      request.nextUrl.searchParams.get('idToken');
    const locale = request.nextUrl.searchParams.get('locale');
    const brandId = request.nextUrl.searchParams.get('brandId');

    // Root /shopify route - redirect to install if no shop is present.
    if (pathname === '/shopify') {
      if (!normalizedShop) {
        return NextResponse.redirect(new URL('/shopify/install', request.url));
      }

      return authorizeShopifyRequest(request, {
        normalizedShop,
        host,
        embedded,
        session,
        idToken,
        locale,
        brandId,
      });
    }

    // Protect all /shopify/* routes except install/auth pages.
    if (pathname.startsWith('/shopify/') &&
        !pathname.startsWith('/shopify/install') &&
        !pathname.startsWith('/shopify/auth-required')) {
      return authorizeShopifyRequest(request, {
        normalizedShop,
        host,
        embedded,
        session,
        idToken,
        locale,
        brandId,
      });
    }

    // No authentication found - redirect to auth required
    if (normalizedShop) {
      const authRequiredUrl = new URL('/shopify/auth-required', request.url);
      authRequiredUrl.searchParams.set('shop', normalizedShop);
      return NextResponse.redirect(authRequiredUrl);
    }

    return NextResponse.next();
  }
  // Skip auth for public routes (signup & login)
  if (
    pathname.startsWith('/api/auth/signup') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/api/giftcard') ||
    pathname.startsWith('/api/shopify/products') ||
    pathname.startsWith('/api/shopify/gift-cards') ||
    pathname.startsWith('/api/shopify/shop') ||
    pathname.startsWith('/api/sync-shopify') ||
    pathname.startsWith('/api/payment/process-card') ||
    pathname.startsWith(`/api/reports/custom`) ||
    pathname.startsWith(`/api/reports/schedule`) ||
    pathname.startsWith('/api/save-card') ||
    pathname.startsWith('/api/voucher/generate-pdf') ||
    pathname.startsWith('/api/auth/[...nextauth]') ||
    pathname.startsWith('/api/auth/providers') ||
    pathname.startsWith('/api/auth/csrf') || 
    pathname.startsWith('/api/auth/signin/google') ||
    pathname.startsWith('/api/auth/callback/google') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/orders')  ||
    pathname.startsWith('/api/newsletter') ||
    pathname.startsWith('/api/contact') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/api/occasion/convert-images-to-jpg')
  ) {
    return NextResponse.next()
  }

  // Require token for other API routes
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      logTrackedRequest(request, 'api-blocked-missing-auth-token');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  logTrackedRequest(request, 'passed-through');
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*','/shopify/:path*','/((?!api|_next/static|_next/image|favicon.ico).*)',], // applies to all API routes
}
