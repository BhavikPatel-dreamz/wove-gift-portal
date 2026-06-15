
// src/app/api/sync-shopify/route.js
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { verifyShopifySessionToken } from '@/lib/shopify.server';
import { isValidInternalRequest } from '@/lib/internal-api-auth';

export async function POST(request) {
  try {
    if (isValidInternalRequest(request)) {
      // Internal server-side syncs are allowed.
    } else if (request.headers.get('authorization')) {
      const tokenValidation = await verifyShopifySessionToken(request);

      if (!tokenValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid Shopify session token.',
            reason: tokenValidation.reason,
          },
          { status: tokenValidation.status },
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized.',
        },
        { status: 401 },
      );
    }

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
