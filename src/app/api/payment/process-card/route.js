"use server"
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
