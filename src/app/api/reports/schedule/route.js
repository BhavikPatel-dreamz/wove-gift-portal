import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { calculateNextDeliveryDate } from "../../../../lib/utils";

// POST: Create a scheduled report
export async function POST(request) {
  try {
    const body = await request.json();
    const { shop, frequency, deliveryDay, deliveryMonth, deliveryYear, emailRecipients, reportTypes, brandId } = body;

    // Validate required fields
    if (!frequency || !emailRecipients || !reportTypes || reportTypes.length === 0) {
      return NextResponse.json(
        { success: false, message: "Frequency, email recipients, and report types are required" },
        { status: 400 }
      );
    }

    // Validate based on frequency
    if (frequency === 'weekly' && !deliveryDay) {
      return NextResponse.json(
        { success: false, message: "Delivery day is required for weekly reports" },
        { status: 400 }
      );
    }

    if (frequency === 'monthly' && (!deliveryDay || !deliveryMonth)) {
      return NextResponse.json(
        { success: false, message: "Delivery day and month are required for monthly reports" },
        { status: 400 }
      );
    }

    if (frequency === 'yearly' && (!deliveryDay || !deliveryMonth || !deliveryYear)) {
      return NextResponse.json(
        { success: false, message: "Delivery day, month, and year are required for yearly reports" },
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
    const nextDeliveryDate = calculateNextDeliveryDate(frequency, deliveryDay, deliveryMonth, deliveryYear);

    const scheduleRecord = await prisma.scheduledReport.create({
      data: {
        shop,
        brandId: brandId === 'all' ? null : brandId,
        frequency,
        deliveryDay,
        deliveryMonth: deliveryMonth || null,
        deliveryYear: deliveryYear || null,
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
    const scheduledReports = await prisma.scheduledReport.findMany({
      where: {
        status: {
          not: "Cancelled",
        },
      },
      include: {
        brand: {
          select: {
            brandName: true,
          },
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
    const { id, frequency, deliveryDay, deliveryMonth, deliveryYear, emailRecipients, reportTypes, status, brandId } = body;

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
    if (deliveryMonth) dataToUpdate.deliveryMonth = deliveryMonth;
    if (deliveryYear) dataToUpdate.deliveryYear = deliveryYear;
    if (emailRecipients) dataToUpdate.emailRecipients = emailRecipients;
    if (reportTypes) dataToUpdate.reportTypes = reportTypes;
    if (status) dataToUpdate.status = status;
    if (body.hasOwnProperty('brandId')) {
        dataToUpdate.brandId = brandId === 'all' ? null : brandId;
    }

    // Calculate new next delivery date if frequency or delivery parameters changed
    if (frequency || deliveryDay || deliveryMonth || deliveryYear) {
      dataToUpdate.nextDeliveryDate = calculateNextDeliveryDate(
        frequency || report.frequency,
        deliveryDay || report.deliveryDay,
        deliveryMonth || report.deliveryMonth,
        deliveryYear || report.deliveryYear
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