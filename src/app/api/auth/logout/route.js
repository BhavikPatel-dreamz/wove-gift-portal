
import { NextResponse } from 'next/server'
import { destroySession } from '../../../../lib/action/userAction/session'

export async function POST() {
  try {
    await destroySession()
    
    return NextResponse.json({
      message: 'Logout successful'
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}