import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    // Check if file exists in request
    if (!body || !body.file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate a unique filename if none provided
    const fileName = body.file.name || `card-${Date.now()}.png`;
    const filePath = path.join(process.cwd(), 'public', 'cards', fileName);

    // Ensure cards directory exists
    const cardsDir = path.join(process.cwd(), 'public', 'cards');
    if (!fs.existsSync(cardsDir)) {
      fs.mkdirSync(cardsDir, { recursive: true });
    }

    // Convert base64 to buffer if needed
    let fileData;
    if (typeof body.file === 'string') {
      // Handle base64 string
      fileData = Buffer.from(body.file.split(',')[1], 'base64');
    } else {
      // Handle file object (assuming it's something with arrayBuffer)
      // This part might need adjustment depending on what client sends.
      // If it's a file from FormData, the whole approach needs to change.
      // For now, assuming it's a structure that can be awaited for an arrayBuffer.
      // But based on the original code, it's more likely a base64 string or a file object with a name.
      // The original `req.body.file.arrayBuffer()` is not standard for a JSON body.
      // Let's stick to the base64 assumption which seems more robust here.
      // If the client sends a file object, it should be as part of FormData, not a JSON body.
      // The original code was flawed in its assumptions.
      // The check `typeof req.body.file === 'string'` is the most likely path.
      return NextResponse.json({ error: 'File data must be a base64 string.' }, { status: 400 });
    }

    // Save file
    fs.writeFileSync(filePath, fileData);

    return NextResponse.json({
      path: `/cards/${fileName}`,
      success: true,
    });
  } catch (error) {
    console.error('Error saving card:', error);
    return NextResponse.json(
      {
        error: 'Failed to save card',
        details: error.message,
      },
      { status: 500 }
    );
  }
}