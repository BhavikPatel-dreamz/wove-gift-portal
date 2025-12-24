/**
 * VERCEL BUILD FAILS BUT LOCAL WORKS
 * Debugging Guide for /api/analytics Route
 */

// ============================================
// 🔍 STEP 1: Check Vercel Environment Variables
// ============================================

/*
LOCAL WORKS but VERCEL FAILS usually means:
- Missing environment variables in Vercel
- Different Node.js version
- Cached build artifacts
- Vercel-specific behavior
*/

// app/api/analytics/route.js

import { headers } from 'next/headers';

/**
 * Diagnostic endpoint - shows what's available
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    
    // Debug mode - shows environment info
    if (url.searchParams.get('debug') === 'true') {
      return Response.json({
        message: 'Debug Info',
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
        platform: process.platform,
        hasAnalyticsKey: !!process.env.ANALYTICS_API_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        allEnvKeys: Object.keys(process.env)
          .filter(key => !key.includes('SECRET'))
          .sort()
      });
    }

    // Regular endpoint
    const headersList = await headers();
    
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics GET error:', error);
    return Response.json(
      { 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    return Response.json({
      success: true,
      received: body
    });

  } catch (error) {
    console.error('Analytics POST error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}