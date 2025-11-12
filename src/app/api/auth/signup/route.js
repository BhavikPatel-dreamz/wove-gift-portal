import {  NextResponse } from 'next/server'
import { signupSchema } from '@/lib/validation'
import { createUser } from '../../../../lib/action/userAction/auth'
import { createSession } from '../../../../lib/action/userAction/session'

export async function POST(request) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = signupSchema.parse(body)

    // Create user
    const user = await createUser(validatedData)

    // Create session
    await createSession(user.id)

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          phone: user.phone || null,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}