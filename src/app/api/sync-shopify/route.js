
// src/app/api/sync-shopify/route.js
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST() {
  try {
    const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'sync-shopify-data.js');
    
    // Promisify exec
    const promiseExec = (command) => {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    reject({error, stderr, stdout});
                    return;
                }
                resolve({stdout, stderr});
            });
        });
    };

    // Execute the script
    await promiseExec(`node "${scriptPath}"`);

    return NextResponse.json({ success: true, message: 'Shopify data sync started.' });
  } catch (error) {
    console.error('Failed to sync Shopify data:', error);
    return NextResponse.json({ success: false, message: 'Failed to start Shopify data sync.', error: error.stderr || error.message }, { status: 500 });
  }
}
