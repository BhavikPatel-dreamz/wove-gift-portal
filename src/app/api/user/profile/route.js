import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { userList } from "../../../../lib/actions/userActions"
import bcrypt from 'bcryptjs';

export async function POST(req) {
 try {
  
 } catch (error) {
  
 }
}

export async function GET(req) {
  try {
    const response = await userList(req);
    if (response.success) {
      return NextResponse.json(
        {
          success: true,
          data: response.userData,
        },
        { status: 200 }
      )
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