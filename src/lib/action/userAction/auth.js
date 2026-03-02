import { prisma } from "../../db";
import { hashPassword, verifyPassword } from "./password";

export async function createUser(data) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      id: true,
      phone: true,
      firstName: true,
      lastName: true,
      isGuest: true,
    },
  });

  const hashedPassword = await hashPassword(data.password);

  if (existingUser) {
    if (!existingUser.isGuest) {
      throw new Error("User already exists with this email");
    }

    const upgradedGuestUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        password: hashedPassword,
        firstName: data.firstName || existingUser.firstName || "Guest",
        lastName: data.lastName || existingUser.lastName || "User",
        phone: data.phone || existingUser.phone || null,
        isGuest: false,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return upgradedGuestUser;
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      phone: data.phone || null,
      role: "CUSTOMER",
      isGuest: false,
      isActive: true, // Set default value
      isVerified: false, // Set default value
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function authenticateUser(data) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      id: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValidPassword = await verifyPassword(data.password, user.password);

  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  // Remove password from response
  const { ...userWithoutPassword } = user;
  
  return userWithoutPassword;
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
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
