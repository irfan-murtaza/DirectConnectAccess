// // import { NextResponse } from 'next/server';
// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { firstName, lastName, email, phoneNumber, inmateName, inmateId, inmateLocation, facilityName } = body;

//     // Validate required fields
//     if (!firstName || !lastName || !email) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Validate environment variables
//     if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
//       console.error('Missing required environment variables');
//       return NextResponse.json(
//         { error: 'Server configuration error' },
//         { status: 500 }
//       );
//     }

//     let customer;

//     // First, check if customer already exists with this email
//     const existingCustomers = await stripe.customers.list({
//       email: email,
//       limit: 1,
//     });

//     if (existingCustomers.data.length > 0) {
//       // Customer exists, use the existing one
//       customer = existingCustomers.data[0];

//       // Update customer information if needed
//       const updatedCustomer = await stripe.customers.update(customer.id, {
//         name: `${firstName} ${lastName}`,
//         phone: phoneNumber || undefined,
//         metadata: {
//           firstName,
//           lastName,
//           inmateName: inmateName || '',
//           inmateId: inmateId || '',
//           inmateLocation: inmateLocation || '',
//           facilityName: facilityName || '',
//           lastUpdated: new Date().toISOString(),
//         },
//       });

//       customer = updatedCustomer;
//       console.log(`Using existing customer: ${customer.id} for email: ${email}`);
//     } else {
//       // Create new customer
//       customer = await stripe.customers.create({
//         name: `${firstName} ${lastName}`,
//         email: email,
//         phone: phoneNumber || undefined,
//         metadata: {
//           firstName,
//           lastName,
//           inmateName: inmateName || '',
//           inmateId: inmateId || '',
//           inmateLocation: inmateLocation || '',
//           facilityName: facilityName || '',
//           createdAt: new Date().toISOString(),
//         },
//       });

//       console.log(`Created new customer: ${customer.id} for email: ${email}`);
//     }

//     // Get the base URL for redirects
//     const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
//                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
//                    'http://localhost:3000';

//     console.log('Environment variables:');
//     console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
//     console.log('VERCEL_URL:', process.env.VERCEL_URL);
//     console.log('Using baseUrl:', baseUrl);
//     console.log('Success URL will be:', `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`);

//     // Create checkout session with the customer
//     const session = await stripe.checkout.sessions.create({
//       customer: customer.id,
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price: process.env.STRIPE_PRICE_ID,
//           quantity: 1,
//         },
//       ],
//       mode: 'payment',
//       success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${baseUrl}/cancel`,
//       metadata: {
//         customerId: customer.id,
//         firstName: firstName,
//         lastName: lastName,
//         phoneNumber: phoneNumber || '',
//         inmateName: inmateName || '',
//         inmateId: inmateId || '',
//         inmateLocation: inmateLocation || '',
//         facilityName: facilityName || '',
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       checkoutUrl: session.url,
//       customerId: customer.id,
//       sessionId: session.id,
//       isExistingCustomer: existingCustomers.data.length > 0,
//     });

//   } catch (error) {
//     console.error('Error creating checkout session:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, updateDoc } from "firebase/firestore";

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

      // Update customer information if needed
      const updatedCustomer = await stripe.customers.update(customer.id, {
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
      customer = updatedCustomer;
      console.log(
        `Using existing customer: ${customer.id} for email: ${email}`
      );
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

    // Prepare initial payment record in Firebase with 'failed'
    const paymentsCollection = collection(db, "payments");
    const paymentDoc = doc(paymentsCollection); // auto-ID
    await setDoc(paymentDoc, {
      firstName,
      lastName,
      email,
      phoneNumber,
      inmateName,
      inmateId,
      inmateLocation,
      facilityName,
      amount: 100, // or whatever amount you want
      status: "failed",
      createdAt: new Date(),
    });

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
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        customerId: customer.id,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber || "",
        inmateName: inmateName || "",
        inmateId: inmateId || "",
        inmateLocation: inmateLocation || "",
        facilityName: facilityName || "",
      },
    });

    // Update the payment's status to 'pending'
    await updateDoc(paymentDoc, {
      status: "pending",
      checkoutId: session.id,
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
