import crypto from "node:crypto";
import { prisma } from "../../db";
import { hashPassword } from "./password";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function generateResetToken() {
  return crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!user) {
    return null;
  }

  const token = generateResetToken();
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  return {
    token,
    user,
    expiresAt,
  };
}

export async function resetPasswordWithToken({ token, newPassword }) {
  const tokenHash = hashResetToken(token);

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!resetRecord || resetRecord.usedAt) {
    throw new Error("Invalid or expired reset link");
  }

  if (resetRecord.expiresAt < new Date()) {
    throw new Error("Invalid or expired reset link");
  }

  const newHashedPassword = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: newHashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        userId: resetRecord.userId,
        id: { not: resetRecord.id },
      },
    }),
    prisma.session.deleteMany({
      where: { userId: resetRecord.userId },
    }),
  ]);

  return {
    userId: resetRecord.userId,
    email: resetRecord.user?.email,
  };
}
