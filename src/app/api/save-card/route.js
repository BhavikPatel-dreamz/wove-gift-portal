import { uploadFile } from '@/lib/utils/cloudinary';
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body || !body.file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const base64Data = body.file.split(",")[1];
    if (!base64Data) {
      return NextResponse.json(
        { error: "Invalid base64 data" },
        { status: 400 }
      );
    }

    // Create a buffer from base64 data
    const buffer = Buffer.from(base64Data, "base64");
    
    // Pass the buffer directly to uploadFile
    const result = await uploadFile(buffer, "cards");

    return NextResponse.json(
      {
        path: result.secure_url,
        public_id: result.public_id,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to save card:", error);
    return NextResponse.json(
      {
        error: "Failed to save card",
        details: error.message,
      },
      { status: 500 }
    );
  }
}