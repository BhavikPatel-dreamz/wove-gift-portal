import { login } from "../../../lib/actions/authAction"
import { NextResponse } from "next/server";

export async function POST(req, res) {
    try {
        const response = await login(req)
        if (response.success) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Login successfully",
                    token: response.token,
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: response.message,
                },
                { status: response.status || 400 }
            );
        }
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    
    }

}