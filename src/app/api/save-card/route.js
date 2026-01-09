import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body || !body.file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = `card-${Date.now()}.png`;
    const cardsDir = path.join(process.cwd(), "public", "cards");
    const filePath = path.join(cardsDir, fileName);

    if (!fs.existsSync(cardsDir)) {
      fs.mkdirSync(cardsDir, { recursive: true });
    }

    const base64Data = body.file.split(",")[1];
    if (!base64Data) {
      return NextResponse.json(
        { error: "Invalid base64 data" },
        { status: 400 }
      );
    }
    const fileData = Buffer.from(base64Data, "base64");

    fs.writeFileSync(filePath, fileData);

    return NextResponse.json(
      {
        path: `/cards/${fileName}`,
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