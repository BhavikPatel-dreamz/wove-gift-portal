import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const email = rawEmail.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    await prisma.newsletterSubscription.upsert({
      where: { email },
      update: {
        wantsAnnouncements: true,
        source: "footer",
      },
      create: {
        email,
        wantsAnnouncements: true,
        source: "footer",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscribed successfully. You will receive gifting updates and announcements.",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to subscribe right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
