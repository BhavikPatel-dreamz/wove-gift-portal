import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { signupSchema } from '@/lib/validation'

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signupSchema.parse(body)
    
    console.log("body",body);
    
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
          name: user.name,
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