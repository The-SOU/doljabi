import { NextRequest, NextResponse } from "next/server";
import { analyzeBabyFace, generateGwansangText } from "@/lib/gemini";
import { matchOccupations } from "@/lib/matching";

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "이미지가 필요합니다" }, { status: 400 });
    }

    // Strip data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Step 1: Analyze face with Gemini Vision
    const analysis = await analyzeBabyFace(base64Data);

    // Step 2: Match against occupations
    const matches = matchOccupations(analysis.featureVector);
    const topMatch = matches[0];

    // Step 3: Generate gwansang text
    const gwansangText = await generateGwansangText(
      topMatch.occupation.nameKo,
      analysis.faceDescription,
      topMatch.percentage,
      topMatch.occupation.gwansangKeywords
    );

    return NextResponse.json({
      topOccupation: {
        occupation: topMatch.occupation,
        similarity: topMatch.similarity,
        percentage: topMatch.percentage,
      },
      allMatches: matches.map((m) => ({
        occupation: m.occupation,
        similarity: m.similarity,
        percentage: m.percentage,
      })),
      gwansangText,
      faceDescription: analysis.faceDescription,
      featureVector: analysis.featureVector,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "분석 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
