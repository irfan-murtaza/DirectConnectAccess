import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      inmateName,
      inmateId,
      inmateLocation,
      facilityName,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
      console.error("Missing required environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    let customer;

    // First, check if customer already exists with this email
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });

    if (existingCustomers.data.length > 0) {
      // Customer exists, use the existing one
      customer = existingCustomers.data[0];

      // Check for active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        return NextResponse.json(
          { error: 'User already has an active subscription.' },
          { status: 409 }
        );
      }

      // Update customer information if needed
      await stripe.customers.update(customer.id, {
        name: `${firstName} ${lastName}`,
        phone: phoneNumber || undefined,
        metadata: {
          firstName,
          lastName,
          inmateName: inmateName || "",
          inmateId: inmateId || "",
          inmateLocation: inmateLocation || "",
          facilityName: facilityName || "",
          lastUpdated: new Date().toISOString(),
        },
      });
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        name: `${firstName} ${lastName}`,
        email: email,
        phone: phoneNumber || undefined,
        metadata: {
          firstName,
          lastName,
          inmateName: inmateName || "",
          inmateId: inmateId || "",
          inmateLocation: inmateLocation || "",
          facilityName: facilityName || "",
          createdAt: new Date().toISOString(),
        },
      });

      console.log(`Created new customer: ${customer.id} for email: ${email}`);
    }

    // Get the base URL for redirects
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      "http://localhost:3000";

    console.log("Environment variables:");
    console.log("NEXT_PUBLIC_APP_URL>", process.env.NEXT_PUBLIC_APP_URL);
    console.log("VERCEL_URL>", process.env.VERCEL_URL);
    console.log("Using baseUrl>", baseUrl);
    console.log(
      "Success URL will be>",
      `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`
    );

    // Create checkout session with the customer
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1Rc83xDIiIX8ElFZNW4b6b7j",
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        metadata: {
          inmateId: inmateId || "",
        }
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      customerId: customer.id,
      sessionId: session.id,
      isExistingCustomer: existingCustomers.data.length > 0,
    });
  } catch (error) {
    console.error("Error creating checkout session?", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

