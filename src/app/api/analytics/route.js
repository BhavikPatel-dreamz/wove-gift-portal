'use strict';

export async function GET(request) {
  try {
    // Server-side code only
    return Response.json({ status: 'ok' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}