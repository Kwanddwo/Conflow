import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import updateCameraReady from "@/server/scripts/updateCameraReadyAssignments";

export async function POST(request: NextRequest) {
  // Verify the request is from Vercel Cron
  console.log("starting cron job: update-camera-ready...");
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error("Unauthorized: could not find header");
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
