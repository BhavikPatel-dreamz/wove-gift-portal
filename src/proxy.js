import { NextResponse } from 'next/server';
import { hasValidSession } from './lib/shopify.server.js';
import { normalizeShopDomain } from './lib/shopify-installation.js';

const SHOPIFY_CONTEXT_HEADERS = {
  shop: 'x-shopify-shop',
  host: 'x-shopify-host',
  embedded: 'x-shopify-embedded',
  locale: 'x-shopify-locale',
  brandId: 'x-shopify-brand-id',
};

function isLikelyShopifyAdminHost(hostValue) {
  if (!hostValue) {
    return false;
  }

  try {
    const decoded = Buffer.from(hostValue, 'base64').toString('utf8');
    return decoded.startsWith('admin.shopify.com/store/');
  } catch {
    return false;
  }
}

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

function buildShopifyFallbackUrl(request, pathname, context = {}) {
  const fallbackUrl = new URL(pathname, request.url);
  const {
    normalizedShop,
    host,
    embedded,
    locale,
    brandId,
  } = context;

  if (normalizedShop) {
    fallbackUrl.searchParams.set('shop', normalizedShop);
  }

  if (host) {
    fallbackUrl.searchParams.set('host', host);
  }

  if (embedded) {
    fallbackUrl.searchParams.set('embedded', embedded);
  }

  if (locale) {
    fallbackUrl.searchParams.set('locale', locale);
  }

  if (brandId) {
    fallbackUrl.searchParams.set('brandId', brandId);
  }

  return fallbackUrl;
}

function rewriteShopifyFallback(request, pathname, context = {}) {
  return NextResponse.rewrite(
    buildShopifyFallbackUrl(request, pathname, context),
  );
}

function passThroughWithShopifyContext(request, context = {}) {
  const requestHeaders = withShopifyContext(request, {
    shop: context.normalizedShop,
    host: context.host,
    embedded: context.embedded,
    locale: context.locale,
    brandId: context.brandId,
  });

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function isShopifyBearerApiRequest(request, pathname) {
  const authorization = request.headers.get('authorization') || '';

  if (!/^Bearer\s+.+/i.test(authorization)) {
    return false;
  }

  return (
    (request.method === 'POST' && pathname.startsWith('/api/reports/custom')) ||
    (request.method === 'POST' && pathname.startsWith('/api/reports/schedule'))
  );
}

async function authorizeShopifyRequest(request, context) {
  const {
    normalizedShop,
    host,
    embedded,
    unauthenticatedPath = '/shopify/auth-required',
  } = context;

  const isEmbeddedContext = embedded === '1' && isLikelyShopifyAdminHost(host);

  if (!normalizedShop) {
    return rewriteShopifyFallback(request, '/shopify/install', context);
  }

  if (!isEmbeddedContext) {
    return rewriteShopifyFallback(request, '/shopify/auth-required', context);
  }

  const validSession = await hasValidSession(normalizedShop);

  if (!validSession) {
    return rewriteShopifyFallback(request, unauthenticatedPath, context);
  }

  return passThroughWithShopifyContext(request, context);
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  logTrackedRequest(request, 'incoming');

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

  const publicApiRoutes = [
    '/api/shopify/webhooks',
  ];

  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    publicApiRoutes.some((route) => pathname.startsWith(route))
  ) {
    logTrackedRequest(request, 'public-route-allowed', {
      matchedPublicRoute:
        publicRoutes.find((route) => pathname.startsWith(route)) ||
        publicApiRoutes.find((route) => pathname.startsWith(route)) ||
        null,
    });
    return NextResponse.next();
  }

  if (isShopifyBearerApiRequest(request, pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/shopify')) {
    const shop = request.nextUrl.searchParams.get('shop');
    const normalizedShop = shop ? normalizeShopDomain(shop) : '';
    const host = request.nextUrl.searchParams.get('host');
    const embedded = request.nextUrl.searchParams.get('embedded');
    const locale = request.nextUrl.searchParams.get('locale');
    const brandId = request.nextUrl.searchParams.get('brandId');
    const idToken = request.nextUrl.searchParams.get('id_token');
    const isEmbeddedContext = embedded === '1' && isLikelyShopifyAdminHost(host);

    if (
      pathname === '/shopify/dashboard' &&
      (idToken || (normalizedShop && isEmbeddedContext))
    ) {
      return passThroughWithShopifyContext(request, {
        normalizedShop,
        host,
        embedded,
        locale,
        brandId,
      });
    }

    if (pathname === '/shopify') {
      if (!normalizedShop) {
        return rewriteShopifyFallback(request, '/shopify/install');
      }

      return authorizeShopifyRequest(request, {
        normalizedShop,
        host,
        embedded,
        locale,
        brandId,
        unauthenticatedPath: '/shopify/install',
      });
    }

    if (
      pathname.startsWith('/shopify/') &&
      !pathname.startsWith('/shopify/install') &&
      !pathname.startsWith('/shopify/auth-required')
    ) {
      return authorizeShopifyRequest(request, {
        normalizedShop,
        host,
        embedded,
        locale,
        brandId,
      });
    }

    if (normalizedShop) {
      return rewriteShopifyFallback(request, '/shopify/auth-required', {
        normalizedShop,
        host,
        embedded,
        locale,
        brandId,
      });
    }

    return NextResponse.next();
  }

  if (
    pathname.startsWith('/api/auth/signup') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/api/giftcard') ||
    pathname.startsWith('/api/shopify/products') ||
    pathname.startsWith('/api/shopify/gift-cards') ||
    pathname.startsWith('/api/shopify/shop') ||
    pathname.startsWith('/api/shopify/session') ||
    pathname.startsWith('/api/sync-shopify') ||
    pathname.startsWith('/api/payment/process-card') ||
    pathname.startsWith('/api/save-card') ||
    pathname.startsWith('/api/voucher/generate-pdf') ||
    pathname.startsWith('/api/auth/[...nextauth]') ||
    pathname.startsWith('/api/auth/providers') ||
    pathname.startsWith('/api/auth/csrf') ||
    pathname.startsWith('/api/auth/signin/google') ||
    pathname.startsWith('/api/auth/callback/google') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/orders') ||
    pathname.startsWith('/api/newsletter') ||
    pathname.startsWith('/api/contact') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/api/occasion/convert-images-to-jpg')
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      logTrackedRequest(request, 'api-blocked-missing-auth-token');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }
  }

  logTrackedRequest(request, 'passed-through');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/shopify/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
