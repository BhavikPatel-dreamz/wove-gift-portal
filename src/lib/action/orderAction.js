"use server";

"use server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "./userAction/session";

const prisma = new PrismaClient();

function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}

function generateGiftCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let giftCode = "";
  for (let i = 0; i < 10; i++) {
    giftCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return giftCode;
}

export const createOrder = async (orderData) => {
  const session = await getSession();
  const userId = session?.userId;

  if (!userId) {
    return {
      error: "User not authenticated.",
    };
  }

  const {
    selectedBrand,
    selectedAmount,
    selectedOccasion,
    selectedSubCategory,
    selectedSubSubCategory,
    personalMessage,
    deliveryMethod,
    deliveryDetails,
    selectedPaymentMethod,
  } = orderData;

  try {
    const receiver = await prisma.receiverDetail.create({
      data: {
        name: deliveryDetails.recipientFullName,
        email: deliveryDetails.recipientEmailAddress,
        phone: deliveryDetails.recipientWhatsAppNumber,
      },
    });

    const order = await prisma.order.create({
      data: {
        brandId: selectedBrand.id,
        occasionId: selectedOccasion,
        subCategoryId: selectedSubCategory,
        subSubCategoryId: selectedSubSubCategory,
        amount: selectedAmount.value,
        currency: selectedAmount.currency,
        message: personalMessage,
        deliveryMethod: deliveryMethod,
        senderDetails: JSON.stringify({
          yourFullName: deliveryDetails.yourFullName,
          yourEmailAddress: deliveryDetails.yourEmailAddress,
        }),
        giftCode: generateGiftCode(),
        orderNumber: generateOrderNumber(),
        paymentMethod: selectedPaymentMethod,
        totalAmount: selectedAmount.value,
        userId: String(userId),
        receiverDetailId: receiver.id,
        sendType: orderData.selectedTiming.type === 'immediate' ? 'sendImmediately' : 'scheduleLater',
        timestamp: new Date(),
      },
    });

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      error: "Failed to create order.",
    };
  }
};

export async function getOrders(params = {}) {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            brand = '',
            dateFrom = '',
            dateTo = '',
            sortBy = 'timestamp',
            sortOrder = 'desc'
        } = params;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const whereClause = {};

        if (search) {
            whereClause.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { giftCode: { contains: search, mode: 'insensitive' } },
                { senderDetails: { contains: search, mode: 'insensitive' } },
                { message: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status) {
            whereClause.redemptionStatus = status;
        }

        if (brand) {
            whereClause.brands = {
                brandName: brand
            };
        }

        if (dateFrom) {
            whereClause.timestamp = { ...whereClause.timestamp, gte: new Date(dateFrom) };
        }
        if (dateTo) {
            whereClause.timestamp = { ...whereClause.timestamp, lte: new Date(dateTo) };
        }

        const orderBy = {};
        orderBy[sortBy] = sortOrder;

        const [orders, totalCount] = await Promise.all([
            prisma.order.findMany({
                where: whereClause,
                orderBy,
                skip,
                take: limitNum,
                include: {
                    brands: {
                        select: {
                            brandName: true,
                            logo: true
                        }
                    },
                    receiverDetail: true
                }
            }),
            prisma.order.count({
                where: whereClause
            })
        ]);

        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        return {
            success: true,
            data: orders,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalItems: totalCount,
                itemsPerPage: limitNum,
                hasNextPage,
                hasPrevPage,
                startIndex: skip + 1,
                endIndex: Math.min(skip + limitNum, totalCount)
            },
            filters: {
                search,
                status,
                brand,
                dateFrom,
                dateTo,
                sortBy,
                sortOrder
            }
        };

    } catch (error) {
        console.error('Error fetching orders:', error);
        return {
            success: false,
            message: 'Failed to fetch orders',
            error: error.message,
            status: 500
        };
    }
}

export async function getOrderById(orderId) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                brands: {
                    select: {
                        brandName: true,
                        logo: true
                    }
                },
                receiverDetail: true,
                occasions: {
                    include: {
                        occasionCategory: true
                    }
                },
                user: true
            }
        });

        if (!order) {
            return {
                success: false,
                message: 'Order not found',
                status: 404
            };
        }

        return {
            success: true,
            data: order
        };

    } catch (error) {
        console.error(`Error fetching order with ID ${orderId}:`, error);
        return {
            success: false,
            message: 'Failed to fetch order',
            error: error.message,
            status: 500
        };
    }
}