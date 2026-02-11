"use server"
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { token, amount, currency } = await req.json();

    const charge = await stripe.charges.create({
      amount,
      currency,
      source: token,
      description: 'Gift Card Purchase',
    });
    
    return NextResponse.json({
      success: true,
      chargeId: charge.id,
      amount: charge.amount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
