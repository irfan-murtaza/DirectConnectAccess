import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, inmateName, inmateId, inmateLocation, facilityName } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let customer;

    // First, check if customer already exists with this email
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      // Customer exists, use the existing one
      customer = existingCustomers.data[0];
      
      // Update customer information if needed
      const updatedCustomer = await stripe.customers.update(customer.id, {
        name: `${firstName} ${lastName}`,
        phone: phoneNumber || undefined,
        metadata: {
          firstName,
          lastName,
          inmateName: inmateName || '',
          inmateId: inmateId || '',
          inmateLocation: inmateLocation || '',
          facilityName: facilityName || '',
          lastUpdated: new Date().toISOString(),
        },
      });
      
      customer = updatedCustomer;
      console.log(`Using existing customer: ${customer.id} for email: ${email}`);
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        name: `${firstName} ${lastName}`,
        email: email,
        phone: phoneNumber || undefined,
        metadata: {
          firstName,
          lastName,
          inmateName: inmateName || '',
          inmateId: inmateId || '',
          inmateLocation: inmateLocation || '',
          facilityName: facilityName || '',
          createdAt: new Date().toISOString(),
        },
      });
      
      console.log(`Created new customer: ${customer.id} for email: ${email}`);
    }

    // Create checkout session with the customer
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cancel`,
      metadata: {
        customerId: customer.id,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber || '',
        inmateName: inmateName || '',
        inmateId: inmateId || '',
        inmateLocation: inmateLocation || '',
        facilityName: facilityName || '',
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      customerId: customer.id,
      sessionId: session.id,
      isExistingCustomer: existingCustomers.data.length > 0,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 