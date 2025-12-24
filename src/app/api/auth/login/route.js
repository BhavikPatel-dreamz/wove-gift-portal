import {  NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validation'

export async function POST(request) {
  try {
    const { createSession } = await import('../../../../lib/action/userAction/session')
    const { authenticateUser } = await import('../../../../lib/action/userAction/auth')
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
        phone: user.phone || null,
        role: user.role || null,
        isActive: user.isActive || null,
        isVerified: user.isVerified || null,
        createdAt: user.createdAt || null,
        updatedAt: user.updatedAt || null,
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