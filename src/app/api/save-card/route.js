import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_CLOUDINARY_API_SECRET
});

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

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "cards" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      ).end(Buffer.from(base64Data, "base64"));
    });

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