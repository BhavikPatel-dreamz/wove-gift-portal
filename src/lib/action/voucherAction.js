"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['warn', 'error'] })

export async function getVouchers(params = {}) {
  const { page = 1, search = '', status = '', dateFrom, dateTo, userId, userRole } = params;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const where = {
    OR: [
      { code: { contains: search, mode: 'insensitive' } },
      { order: { user: { email: { contains: search, mode: 'insensitive' } } } },
    ],
  };

  // Role-based filtering: if not admin, show only user's own records
  if (userRole !== 'ADMIN' && userId) {
    where.order = {
      ...where.order,
      userId: userId,
    };
  }

  if (status) {
    if (status === 'Redeemed') where.isRedeemed = true;
    else if (status === 'Active') where.isRedeemed = false;
    else if (status === 'Expired') where.expiresAt = { lt: new Date() };
  }

  if (dateFrom) where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) };
  if (dateTo) where.createdAt = { ...where.createdAt, lte: new Date(dateTo) };

  try {
    const [voucherCodes, totalCount] = await Promise.all([
      prisma.voucherCode.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          order: {
            include: {
              user: true,
            },
          },
          voucher: true,
          redemptions: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.voucherCode.count({ where }),
    ]);

    const data = voucherCodes.map(vc => {
      const totalRedeemed = vc.redemptions.reduce((sum, r) => sum + r.amountRedeemed, 0);
      const redemptionCount = vc.redemptions.length;
      const lastRedemptionDate = redemptionCount > 0 ? vc.redemptions[redemptionCount - 1].redeemedAt : null;

      let voucherStatus = 'Active';
      if (vc.isRedeemed) voucherStatus = 'Redeemed';
      else if (vc.expiresAt && new Date(vc.expiresAt) < new Date()) voucherStatus = 'Expired';

      return {
        id: vc.id,
        code: vc.code,
        user: vc.order.user,
        voucherType: vc.voucher.denominationType,
        totalAmount: vc.originalValue,
        remainingAmount: vc.remainingValue,
        partialRedemption: vc.voucher.partialRedemption,
        redemptionHistory: vc.redemptions.map(r => ({
          amountRedeemed: r.amountRedeemed,
          redeemedAt: r.redeemedAt,
          balanceAfter: r.balanceAfter,
        })),
        totalRedeemed,
        pendingAmount: vc.originalValue - totalRedeemed,
        redemptionCount,
        lastRedemptionDate,
        expiryDate: vc.expiresAt || vc.voucher.expiresAt,
        status: voucherStatus,
        orderNumber: vc.order.orderNumber,
        bulkOrderNumber: vc.order.bulkOrderNumber,
      };
    });

    return {
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
      },
    };
  } catch (error) {
    console.error("Failed to get vouchers:", error);
    return { success: false, message: "Failed to fetch vouchers." };
  }
}