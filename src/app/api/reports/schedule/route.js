import { NextResponse } from "next/server";
import prisma from "../../../../lib/db";

// POST: Create a scheduled report
export async function POST(request) {
  try {
    const body = await request.json();
    const { frequency, deliveryDay, emailRecipients, reportTypes } = body;

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

    // Store scheduled report in AuditLog (for demo purposes)
    // In production, create a dedicated ScheduledReport table
    const scheduleRecord = await prisma.auditLog.create({
      data: {
        action: "SCHEDULE_REPORT",
        entity: "Report",
        entityId: `${frequency}-${deliveryDay}-${Date.now()}`,
        changes: {
          frequency,
          deliveryDay,
          emailRecipients,
          reportTypes,
          nextDeliveryDate: nextDeliveryDate.toISOString(),
          status: "Active",
          createdAt: new Date().toISOString(),
        },
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Report scheduled successfully",
      data: {
        id: scheduleRecord.id,
        frequency,
        deliveryDay,
        emailRecipients,
        reportTypes,
        nextDeliveryDate: nextDeliveryDate.toISOString(),
        status: "Active",
      },
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
export async function GET() {
  try {
    const scheduledReports = await prisma.auditLog.findMany({
      where: {
        action: "SCHEDULE_REPORT",
        entity: "Report",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    const reports = scheduledReports
      .filter((log) => log.changes?.status !== "Cancelled")
      .map((log) => ({
        id: log.id,
        frequency: log.changes?.frequency,
        deliveryDay: log.changes?.deliveryDay,
        emailRecipients: log.changes?.emailRecipients,
        reportTypes: log.changes?.reportTypes || [],
        nextDeliveryDate: log.changes?.nextDeliveryDate,
        lastDeliveryDate: log.changes?.lastDeliveryDate,
        status: log.changes?.status || "Active",
        createdAt: log.createdAt,
      }));

    return NextResponse.json({
      success: true,
      data: reports,
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

    const report = await prisma.auditLog.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, message: "Scheduled report not found" },
        { status: 404 }
      );
    }

    await prisma.auditLog.update({
      where: { id },
      data: {
        changes: {
          ...report.changes,
          status: "Cancelled",
          cancelledAt: new Date().toISOString(),
        },
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

    const report = await prisma.auditLog.findUnique({
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

    // Calculate new next delivery date if frequency or delivery day changed
    let nextDeliveryDate = report.changes?.nextDeliveryDate;
    if (frequency || deliveryDay) {
      nextDeliveryDate = calculateNextDeliveryDate(
        frequency || report.changes?.frequency,
        deliveryDay || report.changes?.deliveryDay
      ).toISOString();
    }

    const updatedChanges = {
      ...report.changes,
      frequency: frequency || report.changes?.frequency,
      deliveryDay: deliveryDay || report.changes?.deliveryDay,
      emailRecipients: emailRecipients || report.changes?.emailRecipients,
      reportTypes: reportTypes || report.changes?.reportTypes,
      status: status || report.changes?.status,
      nextDeliveryDate,
      updatedAt: new Date().toISOString(),
    };

    await prisma.auditLog.update({
      where: { id },
      data: {
        changes: updatedChanges,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Scheduled report updated successfully",
      data: {
        id,
        ...updatedChanges,
      },
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