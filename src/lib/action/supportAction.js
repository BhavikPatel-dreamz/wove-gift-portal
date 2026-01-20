"use server";

import { prisma } from "../db";
import { sendEmail } from "../email";

function generateSupportId() {
  const prefix = "WG-SUP";
  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${randomNumber}`;
}

export async function createSupportRequest(formData) {
  try {
    const supportId = generateSupportId();

    const newSupportRequest = await prisma.supportRequest.create({
      data: {
        ...formData,
        supportId,
        status: "PENDING",
        // Create initial message if message is provided
        ...(formData.message && {
          messages: {
            create: {
              senderType: "CUSTOMER",
              senderName: formData.name,
              senderEmail: formData.email,
              message: formData.message,
              isRead: false,
            },
          },
        }),
      },
      include: {
        messages: true,
      },
    });

    return {
      success: true,
      data: newSupportRequest,
    };
  } catch (error) {
    console.error("Error creating support request:", error);
    return {
      success: false,
      message: "Failed to create support request",
      error: error.message,
    };
  }
}

export async function getSupportRequests(params = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const whereClause = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { supportId: { contains: search, mode: "insensitive" } },
        { orderNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [requests, totalCount] = await Promise.all([
      prisma.supportRequest.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limitNum,
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1, // Get last message for preview
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.supportRequest.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return {
      success: true,
      data: requests,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching support requests:", error);
    return {
      success: false,
      message: "Failed to fetch support requests",
      error: error.message,
    };
  }
}

export async function getSupportRequestById(id) {
  try {
    const request = await prisma.supportRequest.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!request) {
      return {
        success: false,
        message: "Support request not found",
      };
    }

    return {
      success: true,
      data: request,
    };
  } catch (error) {
    console.error("Error fetching support request:", error);
    return {
      success: false,
      message: "Failed to fetch support request",
      error: error.message,
    };
  }
}

export async function sendMessage(data) {
  try {
    const {
      supportRequestId,
      senderType,
      senderName,
      senderEmail,
      message,
      attachments = [],
      updatedRequest,
    } = data;

    // Create the message
    const newMessage = await prisma.supportMessage.create({
      data: {
        supportRequestId,
        senderType,
        senderName,
        senderEmail,
        message,
        attachments,
        isRead: false,
      },
    });

    console.log("New message created:", {
      supportRequestId,
      senderType,
      senderName,
      senderEmail,
      message,
      attachments,
      isRead: false,
      updatedRequest,
    });

    // Update the support request status if needed
    await prisma.supportRequest.update({
      where: { id: supportRequestId },
      data: {
        updatedAt: new Date(),
        // Auto-open if it's pending
        status: senderType === "CUSTOMER" ? "OPEN" : undefined,
      },
    });

    if (senderType === "ADMIN") {
      try {
        await sendEmail({
          to: updatedRequest.email,
          subject: `Re: Your Support Request #${updatedRequest.supportId}`,
          html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa; color: #343a40; }
              .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
              .header { background-color: #0052e2; padding: 32px 40px; text-align: center; }
              .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; }
              .content { padding: 40px; }
              .content p { margin: 0 0 16px; font-size: 16px; line-height: 1.7; }
              .message-box { background-color: #f1f3f5; border-radius: 8px; padding: 20px; margin-top: 24px; margin-bottom: 24px; }
              .message-box p { margin: 0; font-size: 15px; }
              .button-container { text-align: center; margin-top: 32px; }
              .button { background-color: #0052e2; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; }
              .footer { padding: 24px 40px; background-color: #f1f3f5; text-align: center; }
              .footer p { margin: 0; font-size: 12px; color: #868e96; }
            </style>
          </head>
          <body>
            <table width="100%" border="0" cellspacing="0" cellpadding="20" style="background-color:#f8f9fa;">
              <tr>
                <td>
                  <div class="container">
                    <div class="header">
                      <h1>Wove Support</h1>
                    </div>
                    <div class="content">
                      <p>Hello ${updatedRequest.name},</p>
                      <p>A new message has been sent by our support team in response to your request (<strong>#${updatedRequest.supportId}</strong>).</p>
                      <div class="message-box">
                        <p>${message}</p>
                      </div>
                      <p>You can reply by visiting the support portal directly.</p>
                      <div class="button-container">
                      <a
  href="${process.env.NEXT_PUBLIC_BASE_URL}/track-request"
  style="
    background-color:#0052e2;
    color:#ffffff !important;
    text-decoration:none;
    padding:14px 28px;
    border-radius:50px;
    font-weight:600;
    font-size:16px;
    display:inline-block;
  "
>
  View Conversation
</a>

                      </div>
                    </div>
                    <div class="footer">
                      <p>This is an automated notification. Please do not reply directly to this email.</p>
                      <p>&copy; ${new Date().getFullYear()} Wove. All rights reserved.</p>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </body>
          </html>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send support email:", emailError);
      }
    }

    return {
      success: true,
      data: newMessage,
    };
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      success: false,
      message: "Failed to send message",
      error: error.message,
    };
  }
}

export async function markMessagesAsRead(supportRequestId, senderType) {
  try {
    // Mark all messages from the opposite sender as read
    const oppositeSender = senderType === "CUSTOMER" ? "ADMIN" : "CUSTOMER";

    await prisma.supportMessage.updateMany({
      where: {
        supportRequestId,
        senderType: oppositeSender,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return {
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    };
  }
}

export async function updateSupportStatus(supportRequestId, status) {
  try {
    const updatedRequest = await prisma.supportRequest.update({
      where: { id: supportRequestId },
      data: { status },
    });

    return {
      success: true,
      data: updatedRequest,
    };
  } catch (error) {
    console.error("Error updating support status:", error);
    return {
      success: false,
      message: "Failed to update status",
      error: error.message,
    };
  }
}

export async function getUnreadCount(supportRequestId, senderType) {
  try {
    const oppositeSender = senderType === "CUSTOMER" ? "ADMIN" : "CUSTOMER";

    const count = await prisma.supportMessage.count({
      where: {
        supportRequestId,
        senderType: oppositeSender,
        isRead: false,
      },
    });

    return {
      success: true,
      count,
    };
  } catch (error) {
    console.error("Error getting unread count:", error);
    return {
      success: false,
      count: 0,
    };
  }
}
