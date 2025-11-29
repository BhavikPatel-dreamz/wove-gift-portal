import { NextResponse } from 'next/server';
import { beginAuth } from '@/lib/shopify.server.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  
  if (!shop) {
    return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 });
  }

  try {
    // Use the centralized auth function
    const authUrl = await beginAuth(shop);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ 
      error: 'Authentication failed',
      message: error.message 
    }, { status: 500 });
  }
}