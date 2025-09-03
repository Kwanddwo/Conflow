import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import updateCameraReady from "@/server/scripts/updateCameraReadyAssignments";

async function handleCronRequest(request: NextRequest) {
  // Verify the request is from Vercel Cron
  console.log("starting cron job: update-camera-ready...");

  // Primary security: Check CRON_SECRET
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error("Unauthorized: invalid or missing CRON_SECRET");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Optional secondary check: Vercel cron header (defense in depth)
  const cronHeader = request.headers.get("x-vercel-cron");
  if (cronHeader !== "1") {
    console.error("Unauthorized: missing Vercel cron header");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await updateCameraReady();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}

// Handle both GET (for Vercel cron) and POST requests
export async function GET(request: NextRequest) {
  return handleCronRequest(request);
}

export async function POST(request: NextRequest) {
  return handleCronRequest(request);
}
