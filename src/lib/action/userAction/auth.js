import prisma from '../../db'
import { hashPassword, verifyPassword } from './password'

export async function createUser(data) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    throw new Error('User already exists with this email')
  }

  const hashedPassword = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      phone: data.phone || null,
      role: "CUSTOMER"
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  })

  return user
}

export async function authenticateUser(data) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (!user) {
    throw new Error('Invalid credentials')
  }

  const isValidPassword = await verifyPassword(data.password, user.password)

  if (!isValidPassword) {
    throw new Error('Invalid credentials')
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName || null,
    lastName: user.lastName || null,
  }
}

export async function getUserById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  })
}
