import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    // Check if file exists in request
    if (!req.body || !req.body.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Generate a unique filename if none provided
    const fileName = req.body.file.name || `card-${Date.now()}.png`;
    const filePath = path.join(process.cwd(), 'public', 'cards', fileName);
    
    // Ensure cards directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'public', 'cards'))) {
      fs.mkdirSync(path.join(process.cwd(), 'public', 'cards'));
    }
    
    // Convert base64 to buffer if needed
    let fileData;
    if (typeof req.body.file === 'string') {
      // Handle base64 string
      fileData = Buffer.from(req.body.file.split(',')[1], 'base64');
    } else {
      // Handle file object
      fileData = Buffer.from(await req.body.file.arrayBuffer());
    }
    
    // Save file
    fs.writeFileSync(filePath, fileData);
    
    res.status(200).json({ 
      path: `/cards/${fileName}`,
      success: true 
    });
  } catch (error) {
    console.error('Error saving card:', error);
    res.status(500).json({ 
      error: 'Failed to save card',
      details: error.message 
    });
  }
}