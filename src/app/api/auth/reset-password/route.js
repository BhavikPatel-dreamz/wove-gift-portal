import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validation";
import { resetPasswordWithToken } from "@/lib/action/userAction/passwordReset";
import { createSession } from "@/lib/action/userAction/session";

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const result = await resetPasswordWithToken({ token, newPassword: password });

    if (result.isAdminInviteSetup) {
      await createSession(result.userId);

      return NextResponse.json({
        message: "Password set successfully",
        redirectTo: "/dashboard",
      });
    }

    return NextResponse.json({ message: "Password updated successfully" });
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
