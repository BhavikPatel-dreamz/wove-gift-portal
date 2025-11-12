import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '../../../../lib/action/userAction/session'
import { loginSchema } from '@/lib/validation'
import { authenticateUser } from '../../../../lib/action/userAction/auth'

export async function POST(request) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)

    // Authenticate user
    const user = await authenticateUser(validatedData)

    // Create session
    await createSession(user.id)

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
      }
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, // Don't leak specific error
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}