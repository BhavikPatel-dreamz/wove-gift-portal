import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validation";
import { resetPasswordWithToken } from "@/lib/action/userAction/passwordReset";

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    await resetPasswordWithToken({ token, newPassword: password });

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
