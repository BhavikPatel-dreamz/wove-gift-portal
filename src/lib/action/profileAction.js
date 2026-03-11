"use server";

import { z } from "zod";
import { prisma } from "../db";
import { getSession, validateSession } from "./userAction/session";
import { hashPassword, verifyPassword } from "./userAction/password";

const nameRegex = /^[A-Za-z][A-Za-z\s'-]*$/;
const phoneRegex = /^\+?[0-9()\-\s]+$/;
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{8,100}$/;

const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be 50 characters or less")
    .regex(nameRegex, "First name contains invalid characters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be 50 characters or less")
    .regex(nameRegex, "Last name contains invalid characters"),
  phone: z
    .string()
    .max(20, "Phone number must be 20 characters or less")
    .optional()
    .nullable(),
});

const passwordUpdateSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(100, "New password must be less than 100 characters")
      .regex(
        strongPasswordRegex,
        "New password must include uppercase, lowercase, number, and special character",
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

function normalizePhoneNumber(phone) {
  if (phone === null || phone === undefined) return null;

  const normalized = String(phone).replace(/\s+/g, " ").trim();
  return normalized.length === 0 ? null : normalized;
}

function isValidPhoneNumber(phone) {
  if (!phone) return true;
  if (!phoneRegex.test(phone)) return false;

  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

function formatZodErrors(error) {
  if (!(error instanceof z.ZodError)) {
    return {};
  }

  const fieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path?.[0];
    if (!key || fieldErrors[key]) continue;
    fieldErrors[key] = issue.message;
  }

  return fieldErrors;
}

async function syncSessionUser(updatedUser) {
  const session = await getSession();

  if (!session?.isLoggedIn || session?.userId !== updatedUser.id) {
    return;
  }

  session.user = {
    ...session.user,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    phone: updatedUser.phone,
    updatedAt: updatedUser.updatedAt,
  };

  await session.save();
}

export async function getProfileDetails() {
  try {
    const session = await validateSession();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized access" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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

    if (!user) {
      return { success: false, message: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching profile details:", error);
    return {
      success: false,
      message: "Failed to fetch profile details",
    };
  }
}

export async function updateProfileDetails(payload) {
  try {
    const session = await validateSession();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized access" };
    }

    const parsed = profileUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = formatZodErrors(parsed.error);
      return {
        success: false,
        message: fieldErrors.firstName || fieldErrors.lastName || fieldErrors.phone || "Invalid profile data",
        fieldErrors,
      };
    }

    const normalizedPhone = normalizePhoneNumber(parsed.data.phone);
    if (!isValidPhoneNumber(normalizedPhone)) {
      return {
        success: false,
        message: "Phone number must contain 8 to 15 digits",
        fieldErrors: {
          phone: "Phone number must contain 8 to 15 digits",
        },
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        phone: normalizedPhone,
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

    await syncSessionUser(updatedUser);

    return {
      success: true,
      message: "Profile details updated successfully",
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error updating profile details:", error);
    return {
      success: false,
      message: "Failed to update profile details",
    };
  }
}

export async function updateProfilePassword(payload) {
  try {
    const session = await validateSession();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized access" };
    }

    const parsed = passwordUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = formatZodErrors(parsed.error);
      return {
        success: false,
        message:
          fieldErrors.currentPassword ||
          fieldErrors.newPassword ||
          fieldErrors.confirmPassword ||
          "Invalid password data",
        fieldErrors,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isCurrentPasswordValid = await verifyPassword(
      parsed.data.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      const hasGoogleAccount = user.accounts.some(
        (account) => account.provider === "google",
      );

      return {
        success: false,
        message: hasGoogleAccount
          ? "Current password is incorrect. If you use Google sign-in, continue with Google."
          : "Current password is incorrect",
        fieldErrors: {
          currentPassword: "Current password is incorrect",
        },
      };
    }

    const newHashedPassword = await hashPassword(parsed.data.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newHashedPassword,
      },
    });

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("Error updating password:", error);
    return {
      success: false,
      message: "Failed to update password",
    };
  }
}
