"use server";

import { prisma } from "../db";

export async function getVouchers(params = {}) {
  const { page = 1, search = '', status = '', dateFrom, dateTo, userId, userRole, pageSize = 10, shop } = params;
  const skip = (page - 1) * pageSize;

  try {
    // Build the base where clause for filtering
    const baseWhere = {};

    if (shop) {
      const brand = await prisma.brand.findUnique({
        where: { domain: shop },
        select: { id: true },
      });
      if (brand) {
        baseWhere.brandId = brand.id;
      } else {
        // If shop is provided but not found, return no vouchers.
        return {
          success: true,
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
    }


    // Role-based filtering
    if (userRole !== 'ADMIN' && userId && !shop) {
      baseWhere.userId = userId;
    }

    // Date filtering on orders
    if (dateFrom || dateTo) {
      baseWhere.createdAt = {};
      if (dateFrom) baseWhere.createdAt.gte = new Date(dateFrom);
      if (dateTo) baseWhere.createdAt.lte = new Date(dateTo);
    }

    // Step 1: Fetch all orders that match the criteria - INCLUDE BRAND
    let orders = await prisma.order.findMany({
      where: baseWhere,
      include: {
        user: true,
        brand: true, // Add brand information
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
          order.user?.lastName?.toLowerCase().includes(searchLower) ||
          order.brand?.brandName?.toLowerCase().includes(searchLower);
        
        const matchesVoucherCode = order.voucherCodes.some(vc => 
          vc.code?.toLowerCase().includes(searchLower)
        );

        return matchesOrder || matchesVoucherCode;
      });
    }

    // Step 3: Process each order into records
    const allRecords = [];

    orders.forEach(order => {
      // Skip orders with no voucher codes
      if (order.voucherCodes.length === 0) return;

      // Check if this is a bulk order (has bulkOrderNumber)
      if (order.bulkOrderNumber) {
        // For bulk orders, create ONE record per order (not merged)
        const voucherCodes = order.voucherCodes.map(vc => ({
          ...vc,
          order: order,
          user: order.user,
          brand: order.brand // Pass brand to voucher code
        }));

        const children = voucherCodes.map(vc => mapVoucherCode(vc));
        
        const totalAmount = children.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
        const remainingAmount = children.reduce((sum, v) => sum + (v.remainingAmount || 0), 0);
        const activeCount = children.filter(v => v.status === 'Active').length;
        const redeemedCount = children.filter(v => v.status === 'Redeemed').length;
        const expiredCount = children.filter(v => v.status === 'Expired').length;
        
        // Apply status filter to bulk orders
        let includeThisOrder = true;
        if (status) {
          if (status === 'Active' && activeCount === 0) includeThisOrder = false;
          if (status === 'Redeemed' && redeemedCount === 0) includeThisOrder = false;
          if (status === 'Expired' && expiredCount === 0) includeThisOrder = false;
        }

        if (includeThisOrder) {
          children.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          allRecords.push({
            id: `bulk-${order.id}`,
            isBulkOrder: true,
            bulkOrderNumber: order.bulkOrderNumber,
            orderNumber: order.orderNumber,
            code: `${voucherCodes.length} Vouchers`,
            user: order.user,
            brand: order.brand, // Add brand to bulk order
            brandName: order.brand?.brandName,
            totalAmount,
            remainingAmount,
            currency: order.currency,
            status: activeCount > 0 ? 'Active' : (redeemedCount > 0 ? 'Redeemed' : 'Expired'),
            statusBreakdown: { active: activeCount, redeemed: redeemedCount, expired: expiredCount },
            lastRedemptionDate: children[0]?.lastRedemptionDate,
            voucherCount: voucherCodes.length,
            orderCount: 1, // Each order is separate
            children,
            createdAt: order.createdAt,
          });
        }
      } else {
        // For non-bulk orders, create one record per voucher code
        order.voucherCodes.forEach(vc => {
          const mappedVoucher = mapVoucherCode({
            ...vc,
            order: order,
            user: order.user,
            brand: order.brand // Pass brand to voucher code
          });

          // Apply status filter
          let includeThisVoucher = true;
          if (status) {
            if (status === 'Active' && mappedVoucher.status !== 'Active') includeThisVoucher = false;
            if (status === 'Redeemed' && mappedVoucher.status !== 'Redeemed') includeThisVoucher = false;
            if (status === 'Expired' && mappedVoucher.status !== 'Expired') includeThisVoucher = false;
          }

          if (includeThisVoucher) {
            allRecords.push({
              ...mappedVoucher,
              isBulkOrder: false,
              createdAt: order.createdAt,
            });
          }
        });
      }
    });

    // Step 4: Sort all records by creation date
    allRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Step 5: Apply pagination
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

// New API function to get bulk order details with pagination
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

    // Build where clause
    const where = {};
    if (orderNumber) {
      where.orderNumber = orderNumber;
    } else if (bulkOrderNumber) {
      where.bulkOrderNumber = bulkOrderNumber;
    }

    // Fetch the specific order - INCLUDE BRAND
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: true,
        brand: true, // Add brand information
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

    if (orders.length === 0) {
      return {
        success: false,
        message: "Order not found",
        data: null
      };
    }

    const order = orders[0];

    // Collect all voucher codes from this order
    const allVoucherCodes = [];
    order.voucherCodes.forEach(vc => {
      allVoucherCodes.push({
        ...vc,
        order: order,
        user: order.user,
        brand: order.brand // Pass brand to voucher code
      });
    });

    // Map all vouchers
    let children = allVoucherCodes.map(vc => mapVoucherCode(vc));

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      children = children.filter(child => 
        child.code?.toLowerCase().includes(searchLower) ||
        child.orderNumber?.toLowerCase().includes(searchLower) ||
        child.brandName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (status) {
      children = children.filter(child => child.status === status);
    }

    // Sort by creation date
    children.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate totals from filtered data
    const totalAmount = children.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
    const remainingAmount = children.reduce((sum, v) => sum + (v.remainingAmount || 0), 0);
    const activeCount = children.filter(v => v.status === 'Active').length;
    const redeemedCount = children.filter(v => v.status === 'Redeemed').length;
    const expiredCount = children.filter(v => v.status === 'Expired').length;

    // Apply pagination
    const totalCount = children.length;
    const skip = (page - 1) * pageSize;
    const paginatedChildren = children.slice(skip, skip + pageSize);

    return {
      success: true,
      data: {
        bulkOrderNumber: order.bulkOrderNumber,
        orderNumber: order.orderNumber,
        user: order.user,
        brand: order.brand, // Add brand to response
        brandName: order.brand?.brandName,
        totalAmount,
        remainingAmount,
        currency: order.currency,
        status: activeCount > 0 ? 'Active' : (redeemedCount > 0 ? 'Redeemed' : 'Expired'),
        statusBreakdown: { 
          active: activeCount, 
          redeemed: redeemedCount, 
          expired: expiredCount 
        },
        voucherCount: allVoucherCodes.length,
        orderCount: 1,
        lastRedemptionDate: children[0]?.lastRedemptionDate,
        createdAt: order.createdAt,
        children: paginatedChildren,
      },
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
    return { 
      success: false, 
      message: "Failed to fetch bulk order details.",
      data: null,
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
    brand: vc.brand || vc.order?.brand, // Add brand object
    brandName: vc.brand?.brandName || vc.order?.brand?.brandName, // Add brand name
    voucherType: vc.voucher?.denominationType,
    totalAmount: vc.originalValue || 0,
    remainingAmount: vc.remainingValue || 0,
    currency: vc.order?.currency,
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