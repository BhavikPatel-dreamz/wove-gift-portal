import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, password,phone } = body;
    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: { email, firstName, lastName, password: hashedPassword,phone },
    });

    // IMPORTANT: Do not send the password hash back to the client.
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ success: true, user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    // Log the full error for better debugging on the server.
    console.error('Error creating user:', error);
    return NextResponse.json(
      // Provide a generic error message to the client.
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}