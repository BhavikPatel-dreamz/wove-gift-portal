import {
    NextResponse
} from 'next/server';
import prisma from '../../../../lib/db';
import {
    fetchShopInfo
} from '../../../../lib/action/shopify';

export async function GET(request) {
    try {
        const {
            searchParams
        } = new URL(request.url);
        const shop = searchParams.get('shop');

        if (!shop) {
            return NextResponse.json({
                error: 'Shop parameter is required'
            }, {
                status: 400
            });
        }

        const session = await prisma.appInstallation.findUnique({
            where: {
                shop
            }
        });

        if (!session) {
            return NextResponse.json({
                error: 'Shop not authenticated'
            }, {
                status: 401
            });
        }

        const shopInfo = await fetchShopInfo(session.accessToken, shop);

        return NextResponse.json({
            success: true,
            shop: shopInfo
        });

    } catch (error) {
        console.error('Error fetching shop info:', error);
        return NextResponse.json({
            error: 'Failed to fetch shop info',
            details: error.message
        }, {
            status: 500
        });
    }
}