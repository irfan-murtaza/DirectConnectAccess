const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret_key);
const nodemailer = require("nodemailer");

admin.initializeApp();

const db = admin.firestore();

// TODO: Replace with your actual email service credentials
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // For Gmail
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "irfantech456@gmail.com", // Your email address
    pass: "wukc dqtl unlu ingb", // Your app password
  },
});

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

  try {
    // Handle the event
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customer = await stripe.customers.retrieve(invoice.customer);
        console.log("Payment succeeded for:", customer.email);
        await manageSubscriber(customer, invoice, true);

        // Explicitly check for config and throw error if missing
        const appUrl = functions.config().next.public.app_url;
        console.log("appUrl: ", appUrl)
        if (!appUrl) {
          console.error("CRITICAL: 'next.public.app_url' is not set in Firebase function configuration. Cannot create customer portal link.");
          throw new Error("Server configuration error: App URL is not set.");
        }

        // Create a Stripe Customer Portal session
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customer.id,
          return_url: appUrl,
        });
        const portalUrl = portalSession.url;

        // Send confirmation email
        const mailOptions = {
          from: '"DirectConnect Access" <info@directconnectaccess.com>',
          to: customer.email,
          subject: "Subscription Confirmation",
          html: `
            <p><strong>You're All Set — DirectConnect Access is Ready</strong></p>
            <p>Hi ${customer.name},</p>
            <p>Thank you for subscribing to DirectConnect Access — you've just taken an important step toward keeping your loved one connected, uplifted, and empowered.</p>
            <p><strong>📞 How It Works:</strong></p>
            <p>Your loved one can now access our service directly from inside the facility.</p>
            <p><strong>Have them dial:</strong><br><a href="tel:213-569-0899">(213) 569-0899</a></p>
            <p>When prompted, they'll enter their Inmate ID to unlock their audio session.</p>
            <p><strong>🔄 Manage or Cancel Your Subscription:</strong></p>
            <p>If you ever need to update your payment info or cancel, you can do so anytime:</p>
            <p><a href="${portalUrl}">Manage My Subscription</a></p>
            <p>Or email us at <a href="mailto:info@directconnectaccess.com">info@directconnectaccess.com</a> and we'll help you out.</p>
            <br>
            <p>Thanks again for being part of the DirectConnect Access family.</p>
            <p>With gratitude,<br>The DirectConnect Access Team<br><a href="https://directconnectaccess.com">directconnectaccess.com</a></p>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log("Confirmation email sent to:", customer.email);
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customer = await stripe.customers.retrieve(invoice.customer);
        console.log("Payment failed for:", customer.email);
        await manageSubscriber(customer, invoice, false);

        // Explicitly check for config and throw error if missing
        const appUrl = functions.config().next.public.app_url;
        console.log("appUrl: ", appUrl)
        if (!appUrl) {
          console.error("CRITICAL: 'next.public.app_url' is not set in Firebase function configuration. Cannot create customer portal link.");
          throw new Error("Server configuration error: App URL is not set.");
        }

         // Create a Stripe Customer Portal session for them to fix payment
         const portalSession = await stripe.billingPortal.sessions.create({
            customer: customer.id,
            return_url: appUrl,
          });
          const portalUrl = portalSession.url;
          console.log("portalUrl: ", portalUrl)
          console.log("customer.email: ", portalSession) 
        const mailOptionsFailed = {
            from: '"DirectConnect Access" <info@directconnectaccess.com>',
            to: customer.email,
            subject: "Action Required: Your DirectConnect Access Payment Failed",
            html: `
              <p>Hi ${customer.name},</p>
              <p>We were unable to process the recent payment for your DirectConnect Access subscription. This may be due to an expired card or insufficient funds.</p>
              <p>To avoid any interruption in service for your loved one, please update your payment information as soon as possible.</p>
              <p><a href="${portalUrl}">Update Payment Information</a></p>
              <p>If you have any questions, please contact us at <a href="mailto:info@directconnectaccess.com">info@directconnectaccess.com</a>.</p>
              <p>Sincerely,<br>The DirectConnect Access Team</p>
            `,
        };
        try {
            await transporter.sendMail(mailOptionsFailed);
            console.log("Payment failure email sent to:", customer.email);
        } catch (emailError) {
            console.error("Error sending payment failure email:", emailError);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        if (subscription.cancel_at_period_end) {
          const customer = await stripe.customers.retrieve(subscription.customer);
          console.log("Subscription cancellation scheduled for:", customer.email);
          
          const mailOptionsScheduledCancellation = {
              from: '"DirectConnect Access" <info@directconnectaccess.com>',
              to: customer.email,
              subject: "Your DirectConnect Access Subscription is Scheduled for Cancellation",
              html: `
                <p>Hi ${customer.name},</p>
                <p>This email confirms that your subscription to DirectConnect Access has been scheduled to cancel at the end of your current billing period. Your access will continue until then.</p>
                <p>If you have any questions, or if you did not intend to do this, you can resume your subscription from the customer portal.</p>
                <p>Or email us at <a href="mailto:info@directconnectaccess.com">info@directconnectaccess.com</a> and we'll help you out.</p>
                <br>
                <p>Thanks again for being part of the DirectConnect Access family.</p>
                <p>With gratitude,<br>The DirectConnect Access Team<br><a href="https://directconnectaccess.com">directconnectaccess.com</a></p>
              `,
          };
          try {
              await transporter.sendMail(mailOptionsScheduledCancellation);
              console.log("Cancellation scheduled email sent to:", customer.email);
          } catch (emailError) {
              console.error("Error sending cancellation scheduled email:", emailError);
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        console.log("Subscription cancelled for:", customer.email);
        
        // Pass empty object for invoice as it doesn't exist here
        await manageSubscriber(customer, {}, false);

        const mailOptionsCancelled = {
            from: '"DirectConnect Access" <info@directconnectaccess.com>',
            to: customer.email,
            subject: "Your DirectConnect Access Subscription Has Been Cancelled",
            html: `
              <p>Hi ${customer.name},</p>
              <p>This email confirms that your subscription to DirectConnect Access has been successfully cancelled, and you will not be billed again.</p>
              <p>Thank you for being a part of the DirectConnect Access family. We hope to see you again in the future.</p>
              <p>If you have any questions, or if you did not intend to cancel, please contact us immediately at <a href="mailto:info@directconnectaccess.com">info@directconnectaccess.com</a>.</p>
              <p>Or email us at <a href="mailto:info@directconnectaccess.com">info@directconnectaccess.com</a> and we'll help you out.</p>
              <br>
              <p>Thanks again for being part of the DirectConnect Access family.</p>
              <p>With gratitude,<br>The DirectConnect Access Team<br><a href="https://directconnectaccess.com">directconnectaccess.com</a></p>
            `,
        };
        try {
            await transporter.sendMail(mailOptionsCancelled);
            console.log("Cancellation confirmation email sent to:", customer.email);
        } catch (emailError) {
            console.error("Error sending cancellation email:", emailError);
        }
        break;
      }
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