import { NextRequest, NextResponse } from "next/server";
import { generateTimeline } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { occupationName, occupationId } = await request.json();

    const events = await generateTimeline(occupationName, occupationId);

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Timeline generation error:", error);
    return NextResponse.json({ events: [] });
  }
}
