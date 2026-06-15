"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { isAdminRole, isSuperAdminRole } from "@/lib/roles";
import { validateSession } from "@/lib/action/userAction/session";
import { hashPassword } from "@/lib/action/userAction/password";
import { createPasswordResetToken } from "@/lib/action/userAction/passwordReset";

const adminInviteSchema = z.object({
  email: z.string().email("Enter a valid email address").transform((value) => value.toLowerCase()),
  firstName: z.string().trim().min(1, "First name is required").max(100, "First name is too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(100, "Last name is too long"),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]).default("ADMIN"),
});

const adminStatusSchema = z.object({
  userId: z.string().min(1, "Admin user is required"),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true"),
});

function getAppBaseUrl() {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  return baseUrl.replace(/\/$/, "");
}

function generateInternalPassword() {
  return `Wove-${randomBytes(24).toString("base64url")}1!`;
}

function buildInviteEmailHtml({ name, inviterName, role, setupUrl }) {
  return `
  <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#1f2937;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eef2f7;">
      <div style="background:linear-gradient(90deg,#ec4899,#f97316);padding:24px;text-align:center;color:#ffffff;">
        <h1 style="margin:0;font-size:24px;">Wove backend invitation</h1>
      </div>
      <div style="padding:28px;">
        <p>Hello ${name},</p>
        <p>${inviterName} invited you to access the Wove backend as <strong>${role.replace("_", " ")}</strong>.</p>
        <p>Please set your password using the secure link below. This link expires in 1 hour.</p>
        <p style="margin-top:24px;text-align:center;">
          <a href="${setupUrl}" style="display:inline-block;background:linear-gradient(90deg,#ec4899,#f97316);color:#ffffff;text-decoration:none;border-radius:999px;padding:12px 22px;font-weight:700;">Set your password</a>
        </p>
        <p style="font-size:13px;color:#6b7280;">Setup URL: <a href="${setupUrl}" style="color:#ec4899;">${setupUrl}</a></p>
      </div>
    </div>
  </div>`;
}

function selectAdminUser() {
  return {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    isActive: true,
    isVerified: true,
    createdAt: true,
    updatedAt: true,
  };
}

function serializeAdminUser(user) {
  if (!user) return user;

  return {
    ...user,
    createdAt: user.createdAt?.toISOString?.() || null,
    updatedAt: user.updatedAt?.toISOString?.() || null,
  };
}

async function requireAdminSession() {
  const session = await validateSession();
  const user = session?.user;

  if (!user || !isAdminRole(user.role)) {
    throw new Error("Only administrators can invite backend users.");
  }

  return user;
}

async function getManageableAdminUser(userId, actor) {
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!targetUser || !isAdminRole(targetUser.role)) {
    throw new Error("Admin user not found.");
  }

  if (isSuperAdminRole(targetUser.role) && !isSuperAdminRole(actor.role)) {
    throw new Error("Only super admins can manage super admins.");
  }

  return targetUser;
}

async function ensureCanDeactivateAdmin(targetUser, actor) {
  if (targetUser.id === actor.id) {
    throw new Error("You cannot disable your own admin account.");
  }

  if (!isSuperAdminRole(targetUser.role)) return;

  const activeSuperAdminCount = await prisma.user.count({
    where: {
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  if (activeSuperAdminCount <= 1) {
    throw new Error("At least one active super admin is required.");
  }
}

export async function getAdminUsers() {
  await requireAdminSession();

  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ["ADMIN", "SUPER_ADMIN"],
      },
    },
    select: selectAdminUser(),
    orderBy: [
      { role: "desc" },
      { createdAt: "desc" },
    ],
  });

  return users.map(serializeAdminUser);
}

export async function inviteAdminUser(formData) {
  const invitedBy = await requireAdminSession();
  const payload = Object.fromEntries(formData.entries());
  const parsed = adminInviteSchema.parse(payload);

  if (parsed.role === "SUPER_ADMIN" && !isSuperAdminRole(invitedBy.role)) {
    throw new Error("Only super admins can invite another super admin.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      isGuest: true,
    },
  });

  let user;
  let action = "created";

  if (existingUser) {
    if (isAdminRole(existingUser.role)) {
      throw new Error("This user already has backend administrator access.");
    }

    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        firstName: parsed.firstName || existingUser.firstName,
        lastName: parsed.lastName || existingUser.lastName,
        role: parsed.role,
        isActive: true,
        isVerified: true,
        isGuest: false,
      },
      select: selectAdminUser(),
    });
    action = "promoted";
  } else {
    user = await prisma.user.create({
      data: {
        email: parsed.email,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        password: await hashPassword(generateInternalPassword()),
        role: parsed.role,
        isActive: true,
        isVerified: false,
        isGuest: false,
      },
      select: selectAdminUser(),
    });
  }

  const resetData = await createPasswordResetToken(user.email);

  if (!resetData?.token) {
    throw new Error("Admin user was saved, but the password setup link could not be created.");
  }

  const setupUrl = `${getAppBaseUrl()}/reset-password/${resetData.token}`;
  let emailSent = false;
  let emailError = null;

  try {
    const name = `${user.firstName} ${user.lastName}`.trim() || user.email;
    const inviterName = `${invitedBy.firstName || ""} ${invitedBy.lastName || ""}`.trim() || invitedBy.email;

    await sendEmail({
      to: user.email,
      subject: "You have been invited to the Wove backend",
      html: buildInviteEmailHtml({
        name,
        inviterName,
        role: user.role,
        setupUrl,
      }),
      text: `Hello ${name},\n\n${inviterName} invited you to access the Wove backend as ${user.role}.\nSet your password using this link within 1 hour:\n${setupUrl}`,
    });
    emailSent = true;
  } catch (error) {
    emailError = error?.message || "Invite email could not be sent.";
  }

  revalidatePath("/admin-users");

  return {
    action,
    user: serializeAdminUser(user),
    emailSent,
    emailError,
  };
}

export async function setAdminActiveStatus(formData) {
  const actor = await requireAdminSession();
  const payload = Object.fromEntries(formData.entries());
  const parsed = adminStatusSchema.parse(payload);
  const targetUser = await getManageableAdminUser(parsed.userId, actor);

  if (!parsed.isActive) {
    await ensureCanDeactivateAdmin(targetUser, actor);
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetUser.id },
    data: {
      isActive: parsed.isActive,
    },
    select: selectAdminUser(),
  });

  revalidatePath("/admin-users");

  return {
    user: serializeAdminUser(updatedUser),
  };
}
