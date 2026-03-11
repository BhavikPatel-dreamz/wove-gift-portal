"use server";

import { prisma } from "../db";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createEmptyResponse(page = 1, pageSize = 10, message = null) {
  return {
    success: !message,
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

function getVoucherStatus(vc, order, now) {
  if (order.redemptionStatus === "Cancelled") return "Cancelled";
  if (vc.isRedeemed || vc.remainingValue <= 0) return "Redeemed";
  if (vc.expiresAt && new Date(vc.expiresAt) < now) return "Expired";
  if (!order.isActive) return "Inactive";
  return "Active";
}

function mapVoucherCode(vc, order, now, recipient = null) {
  let totalRedeemed = 0;
  let lastRedemptionDate = null;
  const redemptionHistory = [];

  for (const r of vc.redemptions) {
    totalRedeemed += r.amountRedeemed || 0;
    redemptionHistory.push({
      amountRedeemed: r.amountRedeemed || 0,
      redeemedAt: r.redeemedAt,
      balanceAfter: r.balanceAfter || 0,
    });
  }

  if (vc.redemptions.length > 0) {
    lastRedemptionDate = vc.redemptions[0].redeemedAt;
  }

  const totalAmount = vc.originalValue || 0;
  const status = getVoucherStatus(vc, order, now);

  const mapped = {
    id: vc.id,
    code: vc.code,
    user: order.user,
    brand: order.brand,
    brandName: order.brand?.brandName ?? null,
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
    status,
    orderNumber: order.orderNumber,
    bulkOrderNumber: order.bulkOrderNumber ?? null,
    createdAt: vc.createdAt,
  };

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

// ─── getVouchers ──────────────────────────────────────────────────────────────

export async function getVouchers(params = {}) {
  const {
    page = 1,
    search = "",
    status = "",
    dateFrom,
    dateTo,
    brandId,
    userId,
    userRole,
    pageSize = 10,
    shop,
  } = params;

  const skip = (page - 1) * pageSize;

  try {
    const baseWhere = {};

    if (shop) {
      const brand = await prisma.brand.findUnique({
        where: { domain: shop },
        select: { id: true },
      });
      if (!brand) return createEmptyResponse(page, pageSize);
      baseWhere.brandId = brand.id;
    }

    if (brandId && !baseWhere.brandId) {
      baseWhere.brandId = brandId;
    }

    if (userRole !== "ADMIN" && userId && !shop) {
      baseWhere.userId = userId;
    }

    if (dateFrom || dateTo) {
      baseWhere.createdAt = {};
      if (dateFrom) baseWhere.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        baseWhere.createdAt.lte = endDate;
      }
    }

    if (search?.trim()) {
      baseWhere.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { bulkOrderNumber: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { brand: { brandName: { contains: search, mode: "insensitive" } } },
        { voucherCodes: { some: { code: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where: baseWhere,
      select: {
        id: true,
        orderNumber: true,
        bulkOrderNumber: true,
        currency: true,
        createdAt: true,
        redemptionStatus: true,
        isActive: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        brand: { select: { id: true, brandName: true } },
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
              select: { denominationType: true, partialRedemption: true, expiresAt: true },
            },
            redemptions: {
              select: { amountRedeemed: true, redeemedAt: true, balanceAfter: true },
              orderBy: { redeemedAt: "desc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (orders.length === 0) return createEmptyResponse(page, pageSize);

    const now = new Date();
    const allRecords = [];

    for (const order of orders) {
      if (order.voucherCodes.length === 0) continue;

      if (order.bulkOrderNumber) {
        const children = [];
        let totalAmount = 0;
        let remainingAmount = 0;
        const statusCounts = { Active: 0, Redeemed: 0, Expired: 0, Cancelled: 0, Inactive: 0 };
        let latestRedemptionDate = null;

        for (const vc of order.voucherCodes) {
          const mapped = mapVoucherCode(vc, order, now);
          children.push(mapped);
          totalAmount += mapped.totalAmount;
          remainingAmount += mapped.remainingAmount;
          statusCounts[mapped.status] = (statusCounts[mapped.status] || 0) + 1;

          if (
            mapped.lastRedemptionDate &&
            (!latestRedemptionDate || mapped.lastRedemptionDate > latestRedemptionDate)
          ) {
            latestRedemptionDate = mapped.lastRedemptionDate;
          }
        }

        if (status) {
          const key = status === "Issued" ? "Active" : status;
          if (!statusCounts[key]) continue;
        }

        children.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        let bulkStatus = "Active";
        if (statusCounts.Active > 0) bulkStatus = "Active";
        else if (statusCounts.Redeemed > 0) bulkStatus = "Redeemed";
        else if (statusCounts.Expired > 0) bulkStatus = "Expired";
        else if (statusCounts.Cancelled > 0) bulkStatus = "Cancelled";

        allRecords.push({
          id: `bulk-${order.id}`,
          isBulkOrder: true,
          bulkOrderNumber: order.bulkOrderNumber,
          orderNumber: order.orderNumber,
          code: `${order.voucherCodes.length} Vouchers`,
          user: order.user,
          brand: order.brand,
          brandName: order.brand?.brandName ?? null,
          totalAmount,
          remainingAmount,
          currency: order.currency,
          status: bulkStatus,
          statusBreakdown: {
            active: statusCounts.Active,
            redeemed: statusCounts.Redeemed,
            expired: statusCounts.Expired,
            cancelled: statusCounts.Cancelled,
          },
          lastRedemptionDate: latestRedemptionDate,
          voucherCount: order.voucherCodes.length,
          orderCount: 1,
          children,
          createdAt: order.createdAt,
        });
      } else {
        for (const vc of order.voucherCodes) {
          const mapped = mapVoucherCode(vc, order, now);
          const filterStatus = status === "Issued" ? "Active" : status;
          if (filterStatus && mapped.status !== filterStatus) continue;
          allRecords.push({ ...mapped, isBulkOrder: false });
        }
      }
    }

    const totalCount = allRecords.length;
    const paginatedData = allRecords.slice(skip, skip + pageSize);

    return {
      success: true,
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize) || 0,
        totalCount,
        from: totalCount > 0 ? skip + 1 : 0,
        to: Math.min(skip + pageSize, totalCount),
        total: totalCount,
      },
    };
  } catch (error) {
    console.error("getVouchers error:", error);
    return createEmptyResponse(page, pageSize, "Failed to fetch vouchers.");
  }
}

// ─── getBrandsForFilter ───────────────────────────────────────────────────────

export async function getBrandsForFilter() {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, brandName: true },
      orderBy: { brandName: "asc" },
    });
    return { success: true, data: brands };
  } catch (error) {
    console.error("getBrandsForFilter error:", error);
    return { success: false, message: "Failed to fetch brands.", data: [] };
  }
}

// ─── getBulkOrderDetails ──────────────────────────────────────────────────────

export async function getBulkOrderDetails(params = {}) {
  const {
    bulkOrderNumber,
    orderNumber,
    page = 1,
    pageSize = 10,
    search = "",
    status = "",
  } = params;

  if (!bulkOrderNumber && !orderNumber) {
    return createEmptyResponse(page, pageSize, "Bulk order number or order number is required.");
  }

  const skip = (page - 1) * pageSize;

  try {
    // ✅ KEY FIX: No search/status filter in the DB where clause.
    // Previously the code added `voucherCodes: { some: { code: { contains: search } } }`
    // to the Prisma query. This caused Prisma to return `null` (order not found)
    // whenever the search term didn't match any voucher code — triggering
    // toast.error("Order not found") on EVERY keystroke. 
    // Solution: fetch the full order once, filter children in-memory below.
    const where = {};
    if (orderNumber) {
      where.orderNumber = orderNumber;
    } else if (bulkOrderNumber) {
      where.bulkOrderNumber = bulkOrderNumber;
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
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        brand: { select: { id: true, brandName: true } },
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
              select: { denominationType: true, partialRedemption: true, expiresAt: true },
            },
            redemptions: {
              select: { amountRedeemed: true, redeemedAt: true, balanceAfter: true },
              orderBy: { redeemedAt: "desc" },
            },
          },
        },
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
          orderBy: { rowNumber: "asc" },
        },
      },
    });

    // ✅ KEY FIX: If the order doesn't exist at all, return success:true with
    // empty children — NOT success:false. Returning success:false caused the
    // frontend to call toast.error() which showed repeated "Order not found"
    // toasts on every debounce tick even when the order was valid but had no
    // matching voucher codes for the current search term.
    if (!order) {
      return {
        success: true,
        data: {
          children: [],
          totalAmount: 0,
          remainingAmount: 0,
          voucherCount: 0,
          orderCount: 0,
          statusBreakdown: { active: 0, redeemed: 0, expired: 0, cancelled: 0 },
        },
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

    const hasBulkRecipients = order.bulkRecipients?.length > 0;

    const recipientMap = new Map();
    if (hasBulkRecipients) {
      for (const r of order.bulkRecipients) {
        if (r.voucherCodeId) recipientMap.set(r.voucherCodeId, r);
      }
    }

    const now = new Date();

    // ─── Map ALL children first (totals must reflect entire order, not filtered) ─
    const allChildren = [];
    let totalAmount = 0;
    let remainingAmount = 0;
    const statusCounts = { Active: 0, Redeemed: 0, Expired: 0, Cancelled: 0, Inactive: 0 };
    let emailSentCount = 0;
    let emailDeliveredCount = 0;
    let emailFailedCount = 0;

    for (const vc of order.voucherCodes) {
      const recipient = recipientMap.get(vc.id) || null;
      const mapped = mapVoucherCode(vc, order, now, recipient);

      // Totals always from full set
      totalAmount += mapped.totalAmount;
      remainingAmount += mapped.remainingAmount;
      statusCounts[mapped.status] = (statusCounts[mapped.status] || 0) + 1;

      if (hasBulkRecipients && recipient) {
        if (recipient.emailSent) emailSentCount++;
        if (recipient.emailDelivered) emailDeliveredCount++;
        if (recipient.emailError) emailFailedCount++;
      }

      allChildren.push(mapped);
    }

    // ─── Apply search & status filters IN-MEMORY ──────────────────────────
    let filteredChildren = allChildren;

    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      filteredChildren = filteredChildren.filter(
        (c) =>
          c.code?.toLowerCase().includes(q) ||
          c.orderNumber?.toLowerCase().includes(q)
      );
    }

    if (status) {
      const filterStatus = status === "Issued" ? "Active" : status;
      filteredChildren = filteredChildren.filter((c) => c.status === filterStatus);
    }

    filteredChildren.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalCount = filteredChildren.length;
    const paginatedChildren = filteredChildren.slice(skip, skip + pageSize);

    let bulkStatus = "Active";
    if (statusCounts.Active > 0) bulkStatus = "Active";
    else if (statusCounts.Redeemed > 0) bulkStatus = "Redeemed";
    else if (statusCounts.Expired > 0) bulkStatus = "Expired";
    else if (statusCounts.Cancelled > 0) bulkStatus = "Cancelled";

    const responseData = {
      bulkOrderNumber: order.bulkOrderNumber,
      orderNumber: order.orderNumber,
      user: order.user,
      brand: order.brand,
      brandName: order.brand?.brandName ?? null,
      totalAmount,
      remainingAmount,
      currency: order.currency,
      status: bulkStatus,
      statusBreakdown: {
        active: statusCounts.Active,
        redeemed: statusCounts.Redeemed,
        expired: statusCounts.Expired,
        cancelled: statusCounts.Cancelled,
      },
      voucherCount: order.voucherCodes.length,
      orderCount: 1,
      lastRedemptionDate: allChildren[0]?.lastRedemptionDate ?? null,
      createdAt: order.createdAt,
      children: paginatedChildren,
      hasBulkRecipients,
    };

    if (hasBulkRecipients) {
      responseData.recipientCount = order.bulkRecipients.length;
      responseData.emailDeliveryStats = {
        totalRecipients: order.bulkRecipients.length,
        sent: emailSentCount,
        delivered: emailDeliveredCount,
        failed: emailFailedCount,
        pending: order.bulkRecipients.length - emailSentCount,
      };
    }

    return {
      success: true,
      data: responseData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize) || 0,
        totalCount,
        from: totalCount > 0 ? skip + 1 : 0,
        to: Math.min(skip + pageSize, totalCount),
        total: totalCount,
      },
    };
  } catch (error) {
    console.error("getBulkOrderDetails error:", error);
    return createEmptyResponse(page, pageSize, "Failed to fetch bulk order details.");
  }
}