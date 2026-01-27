"use server";

import { prisma } from "../db";

export async function getVouchers(params = {}) {
  const { 
    page = 1, 
    search = '', 
    status = '', 
    dateFrom, 
    dateTo, 
    brandId,
    userId, 
    userRole, 
    pageSize = 10, 
    shop 
  } = params;
  
  const skip = (page - 1) * pageSize;

  try {
    // Build where clause
    const baseWhere = {};

    // Shop filtering
    if (shop) {
      const brand = await prisma.brand.findUnique({
        where: { domain: shop },
        select: { id: true },
      });
      if (brand) {
        baseWhere.brandId = brand.id;
      } else {
        return createEmptyResponse(page, pageSize);
      }
    }

    // Brand filtering
    if (brandId) {
      baseWhere.brandId = brandId;
    }

    // Role-based filtering
    if (userRole !== 'ADMIN' && userId && !shop) {
      baseWhere.userId = userId;
    }

    // Date filtering
    if (dateFrom || dateTo) {
      baseWhere.createdAt = {};
      if (dateFrom) {
        baseWhere.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        baseWhere.createdAt.lte = endDate;
      }
    }

    // Search filtering
    if (search) {
      baseWhere.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { bulkOrderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { brand: { brandName: { contains: search, mode: 'insensitive' } } },
        { voucherCodes: { some: { code: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    // Fetch orders with optimized select
    const orders = await prisma.order.findMany({
      where: baseWhere,
      select: {
        id: true,
        orderNumber: true,
        bulkOrderNumber: true,
        currency: true,
        createdAt: true,
        redemptionStatus: true, // Added to check for cancelled orders
        isActive: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        brand: {
          select: {
            id: true,
            brandName: true,
          }
        },
        voucherCodes: {
          select: {
            id: true,
            code: true,
            originalValue: true,
            remainingValue: true,
            isRedeemed: true,
            expiresAt: true,
            createdAt: true,
            voucher: {
              select: {
                denominationType: true,
                partialRedemption: true,
                expiresAt: true,
              }
            },
            redemptions: {
              select: {
                amountRedeemed: true,
                redeemedAt: true,
                balanceAfter: true,
              },
              orderBy: { redeemedAt: 'desc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (orders.length === 0) {
      return createEmptyResponse(page, pageSize);
    }

    // Process records
    const allRecords = [];
    const now = new Date();

    orders.forEach(order => {
      if (order.voucherCodes.length === 0) return;

      if (order.bulkOrderNumber) {
        // Process bulk order
        const children = [];
        let totalAmount = 0;
        let remainingAmount = 0;
        let activeCount = 0;
        let redeemedCount = 0;
        let expiredCount = 0;
        let cancelledCount = 0;
        let latestRedemptionDate = null;

        // Single pass through voucher codes
        order.voucherCodes.forEach(vc => {
          const mapped = mapVoucherCodeOptimized(vc, order, now);
          children.push(mapped);

          totalAmount += mapped.totalAmount;
          remainingAmount += mapped.remainingAmount;

          // Count statuses
          switch (mapped.status) {
            case 'Active': activeCount++; break;
            case 'Redeemed': redeemedCount++; break;
            case 'Expired': expiredCount++; break;
            case 'Cancelled': cancelledCount++; break;
          }

          // Track latest redemption
          if (mapped.lastRedemptionDate && 
              (!latestRedemptionDate || mapped.lastRedemptionDate > latestRedemptionDate)) {
            latestRedemptionDate = mapped.lastRedemptionDate;
          }
        });

        // Apply status filter
        if (status) {
          if (status === 'Active' && activeCount === 0) return;
          if (status === 'Redeemed' && redeemedCount === 0) return;
          if (status === 'Expired' && expiredCount === 0) return;
          if (status === 'Cancelled' && cancelledCount === 0) return;
        }

        // Sort children once
        children.sort((a, b) => b.createdAt - a.createdAt);

        // Determine bulk order status
        let bulkStatus = 'Active';
        if (cancelledCount > 0 && cancelledCount === children.length) {
          bulkStatus = 'Cancelled';
        } else if (activeCount > 0) {
          bulkStatus = 'Active';
        } else if (redeemedCount > 0) {
          bulkStatus = 'Redeemed';
        } else if (expiredCount > 0) {
          bulkStatus = 'Expired';
        }

        allRecords.push({
          id: `bulk-${order.id}`,
          isBulkOrder: true,
          bulkOrderNumber: order.bulkOrderNumber,
          orderNumber: order.orderNumber,
          code: `${order.voucherCodes.length} Vouchers`,
          user: order.user,
          brand: order.brand,
          brandName: order.brand?.brandName,
          totalAmount,
          remainingAmount,
          currency: order.currency,
          status: bulkStatus,
          statusBreakdown: { 
            active: activeCount, 
            redeemed: redeemedCount, 
            expired: expiredCount,
            cancelled: cancelledCount 
          },
          lastRedemptionDate: latestRedemptionDate,
          voucherCount: order.voucherCodes.length,
          orderCount: 1,
          children,
          createdAt: order.createdAt,
        });
      } else {
        // Process individual vouchers
        order.voucherCodes.forEach(vc => {
          const mapped = mapVoucherCodeOptimized(vc, order, now);

          // Apply status filter
          if (status && mapped.status !== status) return;

          allRecords.push({
            ...mapped,
            isBulkOrder: false,
            createdAt: order.createdAt,
          });
        });
      }
    });

    // Sort and paginate
    allRecords.sort((a, b) => b.createdAt - a.createdAt);

    const totalCount = allRecords.length;
    const paginatedData = allRecords.slice(skip, skip + pageSize);

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
    return createEmptyResponse(page, pageSize, error.message);
  }
}

// Helper function to map voucher code with optional recipient info
function mapVoucherCodeOptimized(vc, order, now, recipient = null) {
  // Calculate redemption metrics in single pass
  let totalRedeemed = 0;
  let lastRedemptionDate = null;
  const redemptionHistory = [];

  vc.redemptions.forEach(r => {
    totalRedeemed += r.amountRedeemed || 0;
    redemptionHistory.push({
      amountRedeemed: r.amountRedeemed || 0,
      redeemedAt: r.redeemedAt,
      balanceAfter: r.balanceAfter || 0,
    });
  });

  if (vc.redemptions.length > 0) {
    lastRedemptionDate = vc.redemptions[0].redeemedAt;
  }

  // Determine status - CHECK ORDER STATUS FIRST
  let voucherStatus = 'Active';
  
  // Priority 1: Check if order is cancelled
  if (order.redemptionStatus === 'Cancelled') {
    voucherStatus = 'Cancelled';
  }
  // Priority 2: Check if voucher is fully redeemed
  else if (vc.isRedeemed) {
    voucherStatus = 'Redeemed';
  }
  // Priority 3: Check if voucher is expired
  else if (vc.expiresAt && vc.expiresAt < now) {
    voucherStatus = 'Expired';
  }
  // Priority 4: Check if order is inactive
  else if (!order.isActive) {
    voucherStatus = 'Inactive';
  }

  const totalAmount = vc.originalValue || 0;

  const mapped = {
    id: vc.id,
    code: vc.code,
    user: order.user,
    brand: order.brand,
    brandName: order.brand?.brandName,
    voucherType: vc.voucher?.denominationType,
    totalAmount,
    remainingAmount: vc.remainingValue || 0,
    currency: order.currency,
    partialRedemption: vc.voucher?.partialRedemption,
    redemptionHistory,
    totalRedeemed,
    pendingAmount: totalAmount - totalRedeemed,
    redemptionCount: vc.redemptions.length,
    lastRedemptionDate,
    expiryDate: vc.expiresAt || vc.voucher?.expiresAt,
    status: voucherStatus,
    orderNumber: order.orderNumber,
    bulkOrderNumber: order.bulkOrderNumber,
    createdAt: vc.createdAt,
  };

  // Only add recipient info if it exists
  if (recipient) {
    mapped.recipient = {
      id: recipient.id,
      name: recipient.recipientName,
      email: recipient.recipientEmail,
      phone: recipient.recipientPhone,
      personalMessage: recipient.personalMessage,
      emailSent: recipient.emailSent,
      emailSentAt: recipient.emailSentAt,
      emailDelivered: recipient.emailDelivered,
      emailDeliveredAt: recipient.emailDeliveredAt,
      emailError: recipient.emailError,
      rowNumber: recipient.rowNumber,
    };
  }

  return mapped;
}


// Cached brands with simple query
export async function getBrandsForFilter() {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      select: {
        id: true,
        brandName: true,
      },
      orderBy: { brandName: 'asc' },
    });

    return { success: true, data: brands };
  } catch (error) {
    console.error("Failed to get brands:", error);
    return { success: false, message: "Failed to fetch brands.", data: [] };
  }
}

// Bulk order details with single query
export async function getBulkOrderDetails(params = {}) {
  const { bulkOrderNumber, orderNumber, page = 1, pageSize = 10, search = '', status = '' } = params;

  try {
    if (!bulkOrderNumber && !orderNumber) {
      return {
        success: false,
        message: "Bulk order number or order number is required",
        data: null
      };
    }

    const where = {};
    if (orderNumber) {
      where.orderNumber = orderNumber;
    } else if (bulkOrderNumber) {
      where.bulkOrderNumber = bulkOrderNumber;
    }

    // Add search to where clause
    if (search) {
      where.voucherCodes = {
        some: {
          code: { contains: search, mode: 'insensitive' }
        }
      };
    }

    const order = await prisma.order.findFirst({
      where,
      select: {
        id: true,
        orderNumber: true,
        bulkOrderNumber: true,
        currency: true,
        createdAt: true,
        redemptionStatus: true,
        isActive: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        brand: {
          select: {
            id: true,
            brandName: true,
          }
        },
        voucherCodes: {
          select: {
            id: true,
            code: true,
            originalValue: true,
            remainingValue: true,
            isRedeemed: true,
            expiresAt: true,
            createdAt: true,
            voucher: {
              select: {
                denominationType: true,
                partialRedemption: true,
                expiresAt: true,
              }
            },
            redemptions: {
              select: {
                amountRedeemed: true,
                redeemedAt: true,
                balanceAfter: true,
              },
              orderBy: { redeemedAt: 'desc' },
            },
          },
        },
        // Fetch bulk recipients only if they exist
        bulkRecipients: {
          select: {
            id: true,
            voucherCodeId: true,
            recipientName: true,
            recipientEmail: true,
            recipientPhone: true,
            personalMessage: true,
            emailSent: true,
            emailSentAt: true,
            emailDelivered: true,
            emailDeliveredAt: true,
            emailError: true,
            rowNumber: true,
          },
          orderBy: { rowNumber: 'asc' }
        }
      },
    });

    if (!order) {
      return {
        success: false,
        message: "Order not found",
        data: null
      };
    }

    // Check if this order has bulk recipients
    const hasBulkRecipients = order.bulkRecipients && order.bulkRecipients.length > 0;

    // Create a map of voucherCodeId -> recipient for quick lookup
    const recipientMap = new Map();
    if (hasBulkRecipients) {
      order.bulkRecipients.forEach(recipient => {
        if (recipient.voucherCodeId) {
          recipientMap.set(recipient.voucherCodeId, recipient);
        }
      });
    }

    // Single-pass processing
    const now = new Date();
    const children = [];
    let totalAmount = 0;
    let remainingAmount = 0;
    let activeCount = 0;
    let redeemedCount = 0;
    let expiredCount = 0;
    let cancelledCount = 0;

    // Email delivery stats (only relevant if hasBulkRecipients)
    let emailSentCount = 0;
    let emailDeliveredCount = 0;
    let emailFailedCount = 0;

    order.voucherCodes.forEach(vc => {
      // Get recipient info if exists
      const recipient = recipientMap.get(vc.id) || null;
      
      const mapped = mapVoucherCodeOptimized(vc, order, now, recipient);
      
      // Apply status filter inline
      if (status && mapped.status !== status) return;

      children.push(mapped);
      totalAmount += mapped.totalAmount;
      remainingAmount += mapped.remainingAmount;

      switch (mapped.status) {
        case 'Active': activeCount++; break;
        case 'Redeemed': redeemedCount++; break;
        case 'Expired': expiredCount++; break;
        case 'Cancelled': cancelledCount++; break;
      }

      // Track email delivery stats only if bulk recipients exist
      if (hasBulkRecipients && recipient) {
        if (recipient.emailSent) emailSentCount++;
        if (recipient.emailDelivered) emailDeliveredCount++;
        if (recipient.emailError) emailFailedCount++;
      }
    });

    // Sort once
    children.sort((a, b) => b.createdAt - a.createdAt);

    const totalCount = children.length;
    const skip = (page - 1) * pageSize;
    const paginatedChildren = children.slice(skip, skip + pageSize);

    // Determine bulk order status
    let bulkStatus = 'Active';
    if (cancelledCount > 0 && cancelledCount === order.voucherCodes.length) {
      bulkStatus = 'Cancelled';
    } else if (activeCount > 0) {
      bulkStatus = 'Active';
    } else if (redeemedCount > 0) {
      bulkStatus = 'Redeemed';
    } else if (expiredCount > 0) {
      bulkStatus = 'Expired';
    }

    const responseData = {
      bulkOrderNumber: order.bulkOrderNumber,
      orderNumber: order.orderNumber,
      user: order.user,
      brand: order.brand,
      brandName: order.brand?.brandName,
      totalAmount,
      remainingAmount,
      currency: order.currency,
      status: bulkStatus,
      statusBreakdown: { 
        active: activeCount, 
        redeemed: redeemedCount, 
        expired: expiredCount,
        cancelled: cancelledCount 
      },
      voucherCount: order.voucherCodes.length,
      orderCount: 1,
      lastRedemptionDate: children[0]?.lastRedemptionDate,
      createdAt: order.createdAt,
      children: paginatedChildren,
      hasBulkRecipients, // Flag to indicate if bulk recipients exist
    };

    // Only add email delivery stats if bulk recipients exist
    if (hasBulkRecipients) {
      responseData.recipientCount = order.bulkRecipients.length;
      responseData.emailDeliveryStats = {
        totalRecipients: order.bulkRecipients.length,
        sent: emailSentCount,
        delivered: emailDeliveredCount,
        failed: emailFailedCount,
        pending: order.bulkRecipients.length - emailSentCount
      };
    }

    return {
      success: true,
      data: responseData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
        from: totalCount > 0 ? skip + 1 : 0,
        to: Math.min(skip + pageSize, totalCount),
        total: totalCount,
      }
    };
  } catch (error) {
    console.error("Failed to get bulk order details:", error);
    return createEmptyResponse(page, pageSize, error.message);
  }
}
// Helper function
function createEmptyResponse(page, pageSize, message = null) {
  return {
    success: message ? false : true,
    message,
    data: [],
    pagination: {
      currentPage: page,
      totalPages: 0,
      totalCount: 0,
      from: 0,
      to: 0,
      total: 0,
    },
  };
}