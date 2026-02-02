import { NextResponse } from 'next/server';
import { getDashboardData } from '../../../lib/action/dashbordAction';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const period = searchParams.get('period') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const shop = searchParams.get('shop');

    const dashboardData = await getDashboardData({
      period,
      ...(startDate && endDate ? { startDate, endDate } : {}),
      shop,
    });

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}