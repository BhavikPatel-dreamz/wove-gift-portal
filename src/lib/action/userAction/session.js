// src/lib/session.js
"use server"
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import prisma from '../../db'

const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: 'nextjs-auth-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
}

// ✅ Helper to always await cookies()
async function getIronSessionFromCookies() {
  const cookieStore = await cookies()
  return getIronSession(cookieStore, sessionOptions)
}

// Get current session (cookie + user info)
export async function getSession() {
  const session = await getIronSessionFromCookies()

  if (!session.isLoggedIn) {
    session.isLoggedIn = false
  }

  return session
}

// Create a new session for a user
export async function createSession(userId) {
  // Create database session with 30-day expiry
  const dbSession = await prisma.session.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    include: { user: true }, // include full user object
  })

  // Create cookie session
  const session = await getIronSessionFromCookies()
  session.userId = userId
  session.sessionId = dbSession.id
  session.isLoggedIn = true
  session.user = {
    id: dbSession.user.id,
    email: dbSession.user.email,
    firstName: dbSession.user.firstName,
    lastName: dbSession.user.lastName,
    phone: dbSession.user.phone,
    role: dbSession.user.role,
    createdAt: dbSession.user.createdAt,
    updatedAt: dbSession.user.updatedAt,
  }

  await session.save()
  return dbSession.id
}

// Destroy current session
export async function destroySession() {
  const session = await getIronSessionFromCookies()

  // Remove database session
  if (session.sessionId) {
    await prisma.session.delete({
      where: { id: session.sessionId },
    }).catch(() => {
      // Ignore errors if session doesn't exist
    })
  }

  // Clear cookie session
  await session.destroy()
}

// Validate session and return full user info
export async function validateSession() {
  const session = await getIronSessionFromCookies()

  if (!session.isLoggedIn || !session.userId || !session.sessionId) {
    return null
  }

  // Fetch session and user from database
  const dbSession = await prisma.session.findUnique({
    where: { id: session.sessionId },
    include: { user: true },
  })

  // If session doesn't exist or expired, destroy it
  if (!dbSession || dbSession.expiresAt < new Date()) {
    if (session.sessionId) {
      await prisma.session.delete({
        where: { id: session.sessionId },
      }).catch(() => {
        // Ignore errors if session doesn't exist
      })
    }
    return null
  }

  // Return full user info
  return {
    sessionId: dbSession.id,
    expiresAt: dbSession.expiresAt,
    user: {
      id: dbSession.user.id,
      email: dbSession.user.email,
      firstName: dbSession.user.firstName,
      lastName: dbSession.user.lastName,
      phone: dbSession.user.phone,
      role: dbSession.user.role,
      createdAt: dbSession.user.createdAt,
      updatedAt: dbSession.user.updatedAt,
    },
  }
}
