// app/api/support/modify-recipient/route.js

import { NextResponse } from "next/server";
import { modifyRecipientAndResend } from "../../../../lib/action/orderAction";

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { orderNumber, receiverDetailId, recipientData, deliveryMethod } = body;

    if (!orderNumber || !receiverDetailId || !recipientData) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const result = await modifyRecipientAndResend({
      orderNumber,
      receiverDetailId,
      recipientData,
      deliveryMethod,
    });

    return NextResponse.json(result, { status: result.status || 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}