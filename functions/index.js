const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret_key);

admin.initializeApp();

const db = admin.firestore();

// Function to handle the logic for creating or updating a subscriber
const manageSubscriber = async (customer, invoice, isActive) => {
  // Add a defensive check to ensure metadata exists
  if (!customer.metadata) {
    console.error("Error: Customer metadata is missing for customer:", customer.id);
    return; // Exit gracefully if there's no metadata
  }

  const { inmateId } = customer.metadata;

  if (!inmateId) {
    console.error("Error: inmateId not found in customer metadata for customer:", customer.id);
    return;
  }
  console.log("customer: ", customer)
  console.log("invoice: ", invoice)
  const subscriberData = {
    email: customer.email || '',
    firstName: customer.metadata.firstName || '',
    lastName: customer.metadata.lastName || '',
    phoneNumber: customer.phone || '',
    inmateName: customer.metadata.inmateName || '',
    inmateId: inmateId,
    inmateLocation: customer.metadata.inmateLocation || '',
    active: isActive,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    amountPaid: (invoice.amount_paid || 0) / 100,
    stripeCustomerId: customer.id,
  };

  // Search for an existing subscriber with the same inmateId
  const subscribersRef = db.collection("subscribers");
  const snapshot = await subscribersRef.where("inmateId", "==", inmateId).limit(1).get();

  if (snapshot.empty) {
    console.log(`No existing subscriber found for inmateId: ${inmateId}. Creating new record.`);
    await subscribersRef.add(subscriberData);
  } else {
    console.log(`Existing subscriber found for inmateId: ${inmateId}. Updating record.`);
    const docId = snapshot.docs[0].id;
    await subscribersRef.doc(docId).update(subscriberData);
  }
};

exports.stripeWebhook = functions.https.onRequest(async (request, response) => {
  const signature = request.headers["stripe-signature"];
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event;
  try {
    event = stripe.webhooks.constructEvent(request.rawBody, signature, endpointSecret);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return response.sendStatus(400);
  }

  const invoice = event.data.object;

  try {
    const customer = await stripe.customers.retrieve(invoice.customer);

    // Log the entire customer object for debugging
    console.log("Retrieved customer object from Stripe:", JSON.stringify(customer, null, 2));

    // Handle the event
    switch (event.type) {
      case 'invoice.payment_succeeded':
        console.log("Payment succeeded for:", customer.email);
        await manageSubscriber(customer, invoice, true);
        break;
      case 'invoice.payment_failed':
        console.log("Payment failed for:", customer.email);
        await manageSubscriber(customer, invoice, false);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return response.status(500).send("Internal Server Error");
  }

  // Return a 200 response to acknowledge receipt of the event
  response.sendStatus(200);
}); 