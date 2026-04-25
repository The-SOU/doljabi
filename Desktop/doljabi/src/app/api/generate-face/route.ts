import { NextRequest, NextResponse } from "next/server";
import { generateAgedFace } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, targetAge, occupation, faceDescription } = await request.json();

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const result = await generateAgedFace(base64Data, targetAge, occupation, faceDescription);

    if (result) {
      return NextResponse.json({ image: result });
    }

    return NextResponse.json({ image: null, fallback: true });
  } catch (error) {
    console.error("Face generation error:", error);
    return NextResponse.json({ image: null, fallback: true });
  }
}
