// import { NextResponse } from "next/server";
// import { db } from "../../../lib/firebase";
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const {
//       subscriberName,
//       email,
//       phoneNumber,
//       inmateName,
//       inmateId,
//       inmateLocation,
//       facilityName,
//       paymentStatus,
//       amountPaid,
//       stripeSessionId,
//       customerId,
//     } = body;

//     // Save to Firestore
//     const docRef = await addDoc(collection(db, "payments"), {
//       subscriberName: subscriberName || "",
//       email: email || "",
//       phoneNumber: phoneNumber || "",
//       inmateName: inmateName || "",
//       inmateId: inmateId || "",
//       inmateLocation: inmateLocation || "",
//       facilityName: facilityName || "",
//       paymentStatus: paymentStatus || "Success",
//       amountPaid: `${amountPaid || process.env.PRODUCT_PRICE || "20"}$`,
//       stripeSessionId: stripeSessionId || "",
//       customerId: customerId || "",
//       createdAt: serverTimestamp(),
//       timestamp: new Date().toISOString(),
//     });

//     console.log(`Payment data saved to Firestore with ID: ${docRef.id}`);

//     return NextResponse.json({
//       success: true,
//       documentId: docRef.id,
//       message: "Payment data saved successfully",
//     });
//   } catch (error) {
//     console.error("Error saving payment data to Firestore:", error);
//     return NextResponse.json(
//       { error: "Failed to save payment data" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      subscriberName,
      email,
      phoneNumber,
      inmateName,
      inmateId,
      inmateLocation,
      facilityName,
      paymentStatus,
      amountPaid,
      stripeSessionId,
      customerId,
    } = body;

    // Save to Firestore
    const docRef = await addDoc(collection(db, "payments"), {
      subscriberName: subscriberName || "",
      email: email || "",
      phoneNumber: phoneNumber || "",
      inmateName: inmateName || "",
      inmateId: inmateId || "",
      inmateLocation: inmateLocation || "",
      facilityName: facilityName || "",
      paymentStatus: paymentStatus || "Success",
      amountPaid: `${amountPaid || process.env.PRODUCT_PRICE || "20"}$`,
      stripeSessionId: stripeSessionId || "",
      customerId: customerId || "",
      createdAt: serverTimestamp(),
      timestamp: new Date().toISOString(),
    });

    console.log(`Payment data saved to Firestore with ID: ${docRef.id}`);

    console.log("GMAIL_USERNAME:", process.env.GMAIL_USERNAME);
    console.log(
      "GMAIL_PASSWORD:",
      process.env.GMAIL_PASSWORD ? "✔️ Present" : "❌ Missing"
    );

    // ✅ Send Email on successful payment
    if (email) {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "rm1314318@gmail.com",
          pass: "xrtc krwg qdvm yywy",
        },
      });

      const mailOptions = {
        from: "Muneeb Ahmed <rm1314318@gmail.com>",
        to: email,
        subject: "Subscription Confirmation",
        html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Subscription Confirmation</h2>
      <h3>You’re All Set — DirectConnect Access is Ready</h3>

      <p>Hi ${subscriberName || "Subscriber"},</p>

      <p>Thank you for subscribing to <strong>DirectConnect Access</strong> — you’ve just taken an important step toward keeping your loved one connected, uplifted, and empowered.</p>

      <h4>📞 How It Works:</h4>
      <p>Your loved one can now access our service directly from inside the facility.</p>
      <p><strong>Have them dial:</strong><br/>
      <a href="tel:+12135690899">(213) 569-0899</a></p>
      <p>When prompted, they’ll enter their Inmate ID to unlock their audio session.</p>

      <h4>🔄 Manage or Cancel Your Subscription:</h4>
      <p>If you ever need to update your payment info or cancel, you can do so anytime:</p>
      <p><a href="https://directconnectaccess.com/manage-subscription" target="_blank">Manage My Subscription</a></p>
      <p>Or email us at <a href="mailto:info@directconnectaccess.com">info@directconnectaccess.com</a> and we’ll help you out.</p>

      <br/>

      <p>Thanks again for being part of the DirectConnect Access family.</p>

      <p>With gratitude,<br/>
      The DirectConnect Access Team<br/>
      <a href="https://directconnectaccess.com">directconnectaccess.com</a></p>

      <hr/>
      <small>© 2025 DirectConnect Access. All rights reserved.</small>
    </div>
  `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Subscription email sent to:", email);
    }

    return NextResponse.json({
      success: true,
      documentId: docRef.id,
      message: "Payment data saved and email sent successfully",
    });
  } catch (error) {
    console.error("Error in payment/email process:", error);
    return NextResponse.json(
      { error: "Failed to save payment data or send email" },
      { status: 500 }
    );
  }
}
