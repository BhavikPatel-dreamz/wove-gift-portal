import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sessionStorage, verifyWebhook } from '@/lib/shopify.server';

export async function POST(request) {
  try {
    const rawBody = await request.text();

    const { valid, shop } = verifyWebhook(request, rawBody);

    if (!valid || !shop) {
      console.warn('Invalid uninstall webhook or missing shop header');
      return NextResponse.json({ success: false, error: 'Invalid webhook' }, { status: 401 });
    }

    // Remove stored session(s) for this shop
    try {
      await sessionStorage.deleteSession(shop);
    } catch (err) {
      console.error('Error deleting session for shop on uninstall:', shop, err);
    }

    // Mark the app installation as inactive
    try {
      await prisma.appInstallation.updateMany({
        where: { shop },
        data: { isActive: false, accessToken: null },
      });
    } catch (err) {
      console.error('Error marking appInstallation inactive for shop:', shop, err);
    }

    console.log('Handled app/uninstalled for shop:', shop);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('app-uninstalled handler error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
