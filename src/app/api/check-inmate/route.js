// app/api/check-inmate/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const inmateId = searchParams.get("inmateId");

  // Validate input
  if (!inmateId) {
    return new Response(
      JSON.stringify({ error: "inmateId parameter is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Check if this is the test inmate ID
  if (inmateId === "663-75-78") {
    return new Response(
      JSON.stringify({
        active: true,
        inmateId: inmateId,
        name: "Test Inmate",
        balance: 100.0,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Here you would normally check your database
  // For now, we'll return a random response for other IDs
  const isActive = Math.random() > 0.5; // 50% chance of being active

  return new Response(
    JSON.stringify({
      active: isActive,
      inmateId: inmateId,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
