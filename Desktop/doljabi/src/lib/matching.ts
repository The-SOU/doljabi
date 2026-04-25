import { occupations, type Occupation } from "@/data/occupations";
import * as fs from "fs";
import * as path from "path";

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

export interface MatchResult {
  occupation: Occupation;
  similarity: number;
  percentage: number;
}

/**
 * 파이프라인이 생성한 JSON에서 featureVector를 로드.
 * 없으면 occupations.ts의 하드코딩 값 사용.
 */
function getFeatureVector(occupation: Occupation): number[] {
  try {
    const jsonPath = path.join(process.cwd(), "public", "data", "occupations", `${occupation.id}.json`);
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      if (data.featureVector?.length === 10) {
        return data.featureVector;
      }
    }
  } catch {
    // fallback to hardcoded
  }
  return occupation.featureVector;
}

export function matchOccupations(babyVector: number[]): MatchResult[] {
  const results = occupations.map((occupation) => {
    const vector = getFeatureVector(occupation);
    const similarity = cosineSimilarity(babyVector, vector);
    // Add slight randomization (+/- 3%) for variety
    const noise = (Math.random() - 0.5) * 0.06;
    const adjusted = Math.min(1, Math.max(0, similarity + noise));
    return {
      occupation,
      similarity: adjusted,
      percentage: Math.round(adjusted * 1000) / 10,
    };
  });

  return results.sort((a, b) => b.similarity - a.similarity);
}
