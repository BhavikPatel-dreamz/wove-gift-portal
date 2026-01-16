import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

// POST: Create a scheduled report
export async function POST(request) {
  try {
    const body = await request.json();
    const { shop, frequency, deliveryDay, emailRecipients, reportTypes } = body;

    // Validate required fields
    if (!frequency || !deliveryDay || !emailRecipients || !reportTypes || reportTypes.length === 0) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = emailRecipients.split(",").map((e) => e.trim());
    const invalidEmails = emails.filter((email) => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid email addresses: ${invalidEmails.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Calculate next delivery date
    const nextDeliveryDate = calculateNextDeliveryDate(frequency, deliveryDay);

    const scheduleRecord = await prisma.scheduledReport.create({
      data: {
        shop,
        frequency,
        deliveryDay,
        emailRecipients,
        reportTypes,
        nextDeliveryDate,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Report scheduled successfully",
      data: scheduleRecord,
    });
  } catch (error) {
    console.error("Schedule Report API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to schedule report",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// GET: Retrieve all scheduled reports
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // const shop = searchParams.get("shop");

    // if (!shop) {
    //   return NextResponse.json(
    //     { success: false, message: "Shop parameter is required" },
    //     { status: 400 }
    //   );
    // }

    const scheduledReports = await prisma.scheduledReport.findMany({
      where: {
        status: {
          not: "Cancelled",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: scheduledReports,
    });
  } catch (error) {
    console.error("Get Scheduled Reports API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch scheduled reports",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// DELETE: Cancel a scheduled report
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Report ID is required" },
        { status: 400 }
      );
    }

    const report = await prisma.scheduledReport.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, message: "Scheduled report not found" },
        { status: 404 }
      );
    }

    await prisma.scheduledReport.update({
      where: { id },
      data: {
        status: "Cancelled",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Scheduled report cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel Scheduled Report API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to cancel scheduled report",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// PUT: Update a scheduled report
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, frequency, deliveryDay, emailRecipients, reportTypes, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Report ID is required" },
        { status: 400 }
      );
    }

    const report = await prisma.scheduledReport.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, message: "Scheduled report not found" },
        { status: 404 }
      );
    }

    // Validate email if provided
    if (emailRecipients) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emails = emailRecipients.split(",").map((e) => e.trim());
      const invalidEmails = emails.filter((email) => !emailRegex.test(email));

      if (invalidEmails.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid email addresses: ${invalidEmails.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    const dataToUpdate = {};
    if (frequency) dataToUpdate.frequency = frequency;
    if (deliveryDay) dataToUpdate.deliveryDay = deliveryDay;
    if (emailRecipients) dataToUpdate.emailRecipients = emailRecipients;
    if (reportTypes) dataToUpdate.reportTypes = reportTypes;
    if (status) dataToUpdate.status = status;


    // Calculate new next delivery date if frequency or delivery day changed
    if (frequency || deliveryDay) {
      dataToUpdate.nextDeliveryDate = calculateNextDeliveryDate(
        frequency || report.frequency,
        deliveryDay || report.deliveryDay
      );
    }

    const updatedReport = await prisma.scheduledReport.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: "Scheduled report updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    console.error("Update Scheduled Report API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update scheduled report",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// ==================== HELPER FUNCTIONS ====================

function calculateNextDeliveryDate(frequency, deliveryDay) {
  const today = new Date();
  let nextDate = new Date(today);

  switch (frequency) {
    case "daily":
      nextDate.setDate(today.getDate() + 1);
      break;

    case "weekly":
      const daysOfWeek = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };

      const targetDay = daysOfWeek[deliveryDay.toLowerCase()];
      const currentDay = today.getDay();
      let daysUntilTarget = targetDay - currentDay;

      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7;
      }

      nextDate.setDate(today.getDate() + daysUntilTarget);
      break;

    case "monthly":
      const dayOfMonth = parseInt(deliveryDay) || 1;
      nextDate.setMonth(today.getMonth() + 1);
      nextDate.setDate(Math.min(dayOfMonth, 28)); // Avoid invalid dates
      break;

    default:
      nextDate.setDate(today.getDate() + 1);
  }

  nextDate.setHours(9, 0, 0, 0);
  return nextDate;
}