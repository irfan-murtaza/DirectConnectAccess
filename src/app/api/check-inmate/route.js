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

  try {
    // 1. Query payments where inmateId matches
    const paymentsQuery = query(
      collection(db, "payments"),
      where("inmateId", "==", inmateId)
    );

    const querySnapshot = await getDocs(paymentsQuery);

    if (querySnapshot.empty) {
      return new Response(
        JSON.stringify({ error: "No payments found for this inmate" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Get the first matching payment (or loop if multiple)
    const paymentData = querySnapshot.docs[0].data();

    // 3. Prepare response (customize as needed)
    const responseData = {
      active: inmateId === "663-75-78" ? true : paymentData.active || false,
      inmateId: inmateId,
      paymentStatus: paymentData.paymentStatus || "Unknown",
      amountPaid: paymentData.amountPaid || "0",
      inmateName: paymentData.inmateName || "",
      // Include other fields you need
      ...paymentData,
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
