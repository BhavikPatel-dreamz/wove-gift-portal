import { redirect } from 'next/navigation';
import { getSession } from '@/lib/action/userAction/session';
import { getVouchers } from '@/lib/action/voucherAction';
import VouchersClient from '@/components/vouchers/VouchersClient';

export default async function VouchersPage({ searchParams }) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;

  // ✅ REQUIRED: unwrap the Promise
  const params = await searchParams;

  const page = params?.page ? parseInt(params.page, 10) : 1;

  const queryParams = {
    page,
    pageSize: 10,
    search: params?.search || '',
    status: params?.status || '',
    dateFrom: params?.dateFrom || '',
    dateTo: params?.dateTo || '',
    userId: user.id,
    userRole: user.role,
  };

  const vouchersData = await getVouchers(queryParams);

  return (
    <VouchersClient
      initialVouchers={vouchersData.data || []}
      initialPagination={vouchersData.pagination || {}}
      user={user}
    />
  );
}
