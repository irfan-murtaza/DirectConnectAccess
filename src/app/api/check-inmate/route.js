import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const inmateId = searchParams.get("inmateId");

  if (!inmateId) {
    return new Response(
      JSON.stringify({ error: "inmateId parameter is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Clean the inmateId by removing dashes
  const cleanedInmateId = inmateId.replace(/-/g, "");

  try {
    // 1. Query payments where inmateId matches
    const paymentsQuery = query(
      collection(db, "subscribers"),
      where("inmateId", "==", cleanedInmateId)
    );

    const querySnapshot = await getDocs(paymentsQuery);

    if (querySnapshot.empty) {
      return new Response(
        JSON.stringify({ error: "No subscriber found for this inmate" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Get the first matching payment (or loop if multiple)
    const paymentData = querySnapshot.docs[0].data();

    // 3. Prepare response with all specified details
    const responseData = {
      active: paymentData.active || false,
      amountPaid: paymentData.amountPaid ?? 0,
      email: paymentData.email || "",
      firstName: paymentData.firstName || "",
      inmateId: cleanedInmateId,
      inmateLocation: paymentData.inmateLocation || "",
      inmateName: paymentData.inmateName || "",
      lastName: paymentData.lastName || "",
      lastUpdated: paymentData.lastUpdated || null,
      phoneNumber: paymentData.phoneNumber || "",
      stripeCustomerId: paymentData.stripeCustomerId || "",
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Firebase error:", error);
    return new Response(
      JSON.stringify({
        error: "Error fetching payment data",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
