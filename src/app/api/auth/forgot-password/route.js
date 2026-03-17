import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation";
import { createPasswordResetToken } from "@/lib/action/userAction/passwordReset";
import { sendEmail } from "@/lib/email";

function getAppBaseUrl() {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  return baseUrl.replace(/\/$/, "");
}

function buildResetEmailHtml({ name, resetUrl }) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa; color: #1f2937; }
      .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 24px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(90deg, #ec4899, #f97316); padding: 28px 32px; text-align: center; }
      .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
      .content { padding: 32px; }
      .content p { margin: 0 0 16px; font-size: 16px; line-height: 1.7; }
      .button-container { text-align: center; margin-top: 24px; }
      .button { background: linear-gradient(90deg, #ec4899, #f97316); color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 15px; display: inline-block; }
      .link { word-break: break-all; color: #ec4899; }
      .footer { padding: 20px 32px; background-color: #f1f5f9; text-align: center; }
      .footer p { margin: 0; font-size: 12px; color: #6b7280; }
    </style>
  </head>
  <body>
    <table width="100%" border="0" cellspacing="0" cellpadding="20" style="background-color:#f8f9fa;">
      <tr>
        <td>
          <div class="container">
            <div class="header">
              <h1>Reset your Wove password</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>We received a request to reset your Wove password. Click the button below to choose a new one.</p>
              <div class="button-container">
                <a class="button" href="${resetUrl}">Reset password</a>
              </div>
              <p style="margin-top: 24px;">If the button does not work, copy and paste this link into your browser:</p>
              <p><a class="link" href="${resetUrl}">${resetUrl}</a></p>
              <p>If you did not request this, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>This link will expire in 1 hour.</p>
              <p>&copy; ${new Date().getFullYear()} Wove. All rights reserved.</p>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const resetData = await createPasswordResetToken(email);

    if (resetData?.token) {
      const resetUrl = `${getAppBaseUrl()}/reset-password/${resetData.token}`;
      const displayName =
        resetData.user.firstName ||
        resetData.user.lastName ||
        "there";

      await sendEmail({
        to: resetData.user.email,
        subject: "Reset your Wove password",
        html: buildResetEmailHtml({ name: displayName, resetUrl }),
        text: `Hello ${displayName},\n\nReset your Wove password using this link: ${resetUrl}\n\nIf you did not request this, ignore this email. This link expires in 1 hour.`,
      });
    }

    return NextResponse.json({
      message:
        "If an account exists for that email, a reset link has been sent.",
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
