import { occupations, type Occupation } from "@/data/occupations";

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

export function matchOccupations(babyVector: number[]): MatchResult[] {
  const results = occupations.map((occupation) => {
    const similarity = cosineSimilarity(babyVector, occupation.featureVector);
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
