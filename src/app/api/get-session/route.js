import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer']
    });

    // Get customer data from session metadata
    const customerData = {
      firstName: session.metadata?.firstName || '',
      lastName: session.metadata?.lastName || '',
      email: session.customer?.email || '',
      phoneNumber: session.metadata?.phoneNumber || '',
      inmateName: session.metadata?.inmateName || '',
      inmateId: session.metadata?.inmateId || '',
      inmateLocation: session.metadata?.inmateLocation || '',
      facilityName: session.metadata?.facilityName || ''
    };

    return NextResponse.json({
      sessionId: session.id,
      customerId: session.customer?.id || '',
      amountPaid: (session.amount_total / 100).toString(), // Convert from cents to dollars
      currency: session.currency,
      paymentStatus: session.payment_status,
      customerData
    });

  } catch (error) {
    console.error('Error retrieving session:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session data' },
      { status: 500 }
    );
  }
} 