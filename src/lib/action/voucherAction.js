"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

export async function getVouchers(params = {}) {
  const { page = 1, search = '', status = '', dateFrom, dateTo, userId, userRole, pageSize = 10 } = params;
  const skip = (page - 1) * pageSize;

  try {
    // Build the base where clause for filtering
    const baseWhere = {};

    // Role-based filtering
    if (userRole !== 'ADMIN' && userId) {
      baseWhere.userId = userId;
    }

    // Date filtering on orders
    if (dateFrom || dateTo) {
      baseWhere.createdAt = {};
      if (dateFrom) baseWhere.createdAt.gte = new Date(dateFrom);
      if (dateTo) baseWhere.createdAt.lte = new Date(dateTo);
    }

    // Step 1: Fetch all orders that match the criteria
    let orders = await prisma.order.findMany({
      where: baseWhere,
      include: {
        user: true,
        voucherCodes: {
          include: {
            voucher: true,
            redemptions: {
              orderBy: { redeemedAt: 'desc' }
            },
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Step 2: Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(order => {
        const matchesOrder = 
          order.orderNumber?.toLowerCase().includes(searchLower) ||
          order.bulkOrderNumber?.toLowerCase().includes(searchLower) ||
          order.user?.email?.toLowerCase().includes(searchLower) ||
          order.user?.firstName?.toLowerCase().includes(searchLower) ||
          order.user?.lastName?.toLowerCase().includes(searchLower);
        
        const matchesVoucherCode = order.voucherCodes.some(vc => 
          vc.code?.toLowerCase().includes(searchLower)
        );

        return matchesOrder || matchesVoucherCode;
      });
    }

    // Step 3: Group orders by bulkOrderNumber (if exists)
    const bulkOrdersMap = new Map();
    const individualOrders = [];

    orders.forEach(order => {
      if (order.bulkOrderNumber && order.voucherCodes.length > 0) {
        const bulkKey = order.bulkOrderNumber;
        if (!bulkOrdersMap.has(bulkKey)) {
          bulkOrdersMap.set(bulkKey, []);
        }
        bulkOrdersMap.get(bulkKey).push(order);
      } else if (order.voucherCodes.length > 0) {
        individualOrders.push(order);
      }
    });

    // Step 4: Create grouped records
    const allGroupedRecords = [];

    // Process bulk orders (each bulk order becomes one record)
    bulkOrdersMap.forEach((ordersList, bulkOrderNumber) => {
      // Only create bulk order group if there are 3 or more orders
      if (ordersList.length >= 3) {
        const allVoucherCodes = [];
        
        ordersList.forEach(order => {
          order.voucherCodes.forEach(vc => {
            allVoucherCodes.push({
              ...vc,
              order: order,
              user: order.user
            });
          });
        });

        const children = allVoucherCodes.map(vc => mapVoucherCode(vc));
        
        const totalAmount = children.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
        const remainingAmount = children.reduce((sum, v) => sum + (v.remainingAmount || 0), 0);
        const activeCount = children.filter(v => v.status === 'Active').length;
        const redeemedCount = children.filter(v => v.status === 'Redeemed').length;
        const expiredCount = children.filter(v => v.status === 'Expired').length;
        
        // Apply status filter to bulk orders
        let includeThisBulkOrder = true;
        if (status) {
          if (status === 'Active' && activeCount === 0) includeThisBulkOrder = false;
          if (status === 'Redeemed' && redeemedCount === 0) includeThisBulkOrder = false;
          if (status === 'Expired' && expiredCount === 0) includeThisBulkOrder = false;
        }

        if (includeThisBulkOrder) {
          children.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          allGroupedRecords.push({
            id: `bulk-${bulkOrderNumber}`,
            isBulkOrder: true,
            bulkOrderNumber,
            orderNumber: ordersList[0].orderNumber,
            code: `${allVoucherCodes.length} Vouchers`,
            user: ordersList[0].user,
            totalAmount,
            remainingAmount,
            status: activeCount > 0 ? 'Active' : (redeemedCount > 0 ? 'Redeemed' : 'Expired'),
            statusBreakdown: { active: activeCount, redeemed: redeemedCount, expired: expiredCount },
            lastRedemptionDate: children[0]?.lastRedemptionDate,
            voucherCount: allVoucherCodes.length,
            orderCount: ordersList.length,
            children,
            createdAt: ordersList[0].createdAt,
          });
        }
      } else {
        // If less than 3 orders, treat them as individual orders
        ordersList.forEach(order => {
          individualOrders.push(order);
        });
      }
    });

    // Process individual orders (each voucher code becomes one record)
    individualOrders.forEach(order => {
      order.voucherCodes.forEach(vc => {
        const mappedVoucher = mapVoucherCode({
          ...vc,
          order: order,
          user: order.user
        });

        // Apply status filter
        let includeThisVoucher = true;
        if (status) {
          if (status === 'Active' && mappedVoucher.status !== 'Active') includeThisVoucher = false;
          if (status === 'Redeemed' && mappedVoucher.status !== 'Redeemed') includeThisVoucher = false;
          if (status === 'Expired' && mappedVoucher.status !== 'Expired') includeThisVoucher = false;
        }

        if (includeThisVoucher) {
          allGroupedRecords.push({
            ...mappedVoucher,
            isBulkOrder: false,
            createdAt: order.createdAt,
          });
        }
      });
    });

    // Step 5: Sort all records by creation date
    allGroupedRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Step 6: Apply pagination
    const totalCount = allGroupedRecords.length;
    const paginatedData = allGroupedRecords.slice(skip, skip + pageSize);

    return {
      success: true,
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
        from: totalCount > 0 ? skip + 1 : 0,
        to: Math.min(skip + pageSize, totalCount),
        total: totalCount,
      },
    };
  } catch (error) {
    console.error("Failed to get vouchers:", error);
    return { 
      success: false, 
      message: "Failed to fetch vouchers.",
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        from: 0,
        to: 0,
        total: 0,
      }
    };
  }
}

// Helper function to map voucher code to response format
function mapVoucherCode(vc) {
  const totalRedeemed = vc.redemptions.reduce((sum, r) => sum + (r.amountRedeemed || 0), 0);
  const redemptionCount = vc.redemptions.length;
  const lastRedemptionDate = redemptionCount > 0 
    ? vc.redemptions[0].redeemedAt 
    : null;

  let voucherStatus = 'Active';
  if (vc.isRedeemed) {
    voucherStatus = 'Redeemed';
  } else if (vc.expiresAt && new Date(vc.expiresAt) < new Date()) {
    voucherStatus = 'Expired';
  }

  return {
    id: vc.id,
    code: vc.code,
    user: vc.order?.user || vc.user,
    voucherType: vc.voucher?.denominationType,
    totalAmount: vc.originalValue || 0,
    remainingAmount: vc.remainingValue || 0,
    partialRedemption: vc.voucher?.partialRedemption,
    redemptionHistory: vc.redemptions.map(r => ({
      amountRedeemed: r.amountRedeemed || 0,
      redeemedAt: r.redeemedAt,
      balanceAfter: r.balanceAfter || 0,
    })),
    totalRedeemed,
    pendingAmount: (vc.originalValue || 0) - totalRedeemed,
    redemptionCount,
    lastRedemptionDate,
    expiryDate: vc.expiresAt || vc.voucher?.expiresAt,
    status: voucherStatus,
    orderNumber: vc.order?.orderNumber,
    bulkOrderNumber: vc.order?.bulkOrderNumber,
    createdAt: vc.createdAt,
  };
}