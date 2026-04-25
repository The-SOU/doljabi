/**
 * 직업별 평균 얼굴 데이터 생성 파이프라인
 *
 * 1. Google Custom Search API로 직업별 한국인 유명인 얼굴 이미지 URL 수집
 * 2. Gemini Vision으로 이미지들의 공통 얼굴 특징 추출 → feature vector + 설명
 * 3. Gemini Image로 직업별 "대표 평균 얼굴" 이미지 생성
 *
 * 필요한 환경 변수 (.env.local):
 *   GEMINI_API_KEY - Google AI Studio API key
 *   GOOGLE_CSE_ID  - Custom Search Engine ID
 *   GOOGLE_CSE_API_KEY - Custom Search API key
 *
 * 실행: npx tsx scripts/generate-occupation-data.ts
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

// Load .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const [key, ...vals] = line.split("=");
    if (key && vals.length) {
      process.env[key.trim()] = vals.join("=").trim();
    }
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const CSE_ID = process.env.GOOGLE_CSE_ID;
const CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const OUTPUT_DIR = path.resolve(__dirname, "../public/data/occupations");

interface OccupationConfig {
  id: string;
  nameKo: string;
  searchQueries: string[];
}

const OCCUPATIONS: OccupationConfig[] = [
  {
    id: "doctor",
    nameKo: "의사",
    searchQueries: ["한국 유명 의사 얼굴", "한국 의사 프로필 사진"],
  },
  {
    id: "lawyer",
    nameKo: "변호사",
    searchQueries: ["한국 유명 변호사 얼굴", "한국 변호사 프로필"],
  },
  {
    id: "scientist",
    nameKo: "과학자",
    searchQueries: ["한국 유명 과학자 얼굴", "한국 과학자 프로필"],
  },
  {
    id: "ceo",
    nameKo: "CEO",
    searchQueries: ["한국 유명 CEO 얼굴", "한국 대기업 CEO 프로필"],
  },
  {
    id: "youtuber",
    nameKo: "100만 유튜버",
    searchQueries: ["한국 유명 유튜버 얼굴", "한국 인기 유튜버"],
  },
  {
    id: "idol",
    nameKo: "아이돌",
    searchQueries: ["한국 아이돌 얼굴", "K-pop 아이돌 프로필"],
  },
  {
    id: "soccer",
    nameKo: "축구선수",
    searchQueries: ["한국 유명 축구선수 얼굴", "한국 국가대표 축구선수"],
  },
  {
    id: "chef",
    nameKo: "셰프",
    searchQueries: ["한국 유명 셰프 얼굴", "한국 스타 셰프 프로필"],
  },
  {
    id: "president",
    nameKo: "대통령",
    searchQueries: ["한국 역대 대통령 얼굴", "대한민국 대통령 프로필"],
  },
  {
    id: "judge",
    nameKo: "판사",
    searchQueries: ["한국 유명 판사 얼굴", "한국 대법관 프로필"],
  },
];

// ─── Step 1: Google Custom Search로 이미지 URL 수집 ───

async function searchImages(query: string, count: number = 10): Promise<string[]> {
  if (!CSE_ID || !CSE_API_KEY) {
    console.log(`  ⚠️  Custom Search API 키 없음, 건너뜀: "${query}"`);
    return [];
  }

  const params = new URLSearchParams({
    key: CSE_API_KEY,
    cx: CSE_ID,
    q: query,
    searchType: "image",
    imgType: "face",
    num: String(Math.min(count, 10)),
    imgSize: "medium",
  });

  const url = `https://www.googleapis.com/customsearch/v1?${params}`;

  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.items) {
              resolve(json.items.map((item: { link: string }) => item.link));
            } else {
              console.log(`  ⚠️  검색 결과 없음: "${query}"`, json.error?.message || "");
              resolve([]);
            }
          } catch {
            resolve([]);
          }
        });
      })
      .on("error", () => resolve([]));
  });
}

async function collectImagesForOccupation(config: OccupationConfig): Promise<string[]> {
  const allUrls: string[] = [];
  for (const query of config.searchQueries) {
    console.log(`  🔍 검색: "${query}"`);
    const urls = await searchImages(query, 10);
    allUrls.push(...urls);
    // Rate limit: 100 queries/day free tier
    await sleep(1000);
  }
  return [...new Set(allUrls)]; // dedupe
}

// ─── Step 2: 이미지 다운로드 + base64 변환 ───

function downloadImageAsBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 10000);

    const protocol = url.startsWith("https") ? https : http;
    protocol
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          // Follow redirect
          if (res.headers.location) {
            clearTimeout(timeout);
            downloadImageAsBase64(res.headers.location).then(resolve);
            return;
          }
        }
        if (res.statusCode !== 200) {
          clearTimeout(timeout);
          resolve(null);
          return;
        }

        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          clearTimeout(timeout);
          const buffer = Buffer.concat(chunks);
          if (buffer.length < 1000) {
            resolve(null);
            return;
          }
          resolve(buffer.toString("base64"));
        });
      })
      .on("error", () => {
        clearTimeout(timeout);
        resolve(null);
      });
  });
}

// ─── Step 3: Gemini Vision으로 얼굴 특징 추출 ───

interface OccupationFeatures {
  id: string;
  nameKo: string;
  featureVector: number[];
  commonFeatures: {
    faceShape: string;
    eyeCharacteristics: string;
    noseCharacteristics: string;
    jawline: string;
    overallImpression: string;
  };
  gwansangInterpretation: string;
  imageCount: number;
  method: "image_analysis" | "text_inference";
}

async function extractFeaturesFromImages(
  config: OccupationConfig,
  imageBase64s: string[]
): Promise<OccupationFeatures> {
  console.log(`  🧠 Gemini Vision 분석 중 (이미지 ${imageBase64s.length}장)...`);

  const imageParts = imageBase64s.slice(0, 8).map((data) => ({
    inlineData: {
      mimeType: "image/jpeg" as const,
      data,
    },
  }));

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          ...imageParts,
          {
            text: `위 이미지들은 한국의 ${config.nameKo} 종사자들의 얼굴 사진입니다.
이 얼굴들의 공통적인 특징을 분석하여 아래 JSON 형식으로 응답해주세요.

{
  "featureVector": [0.0~1.0 사이의 숫자 10개 - 순서: 얼굴너비비율, 눈사이거리비율, 이마높이비율, 코너비비율, 입풍만도, 턱각도, 광대돌출도, 얼굴대칭도, 눈크기, 턱형태],
  "commonFeatures": {
    "faceShape": "공통 얼굴형 설명",
    "eyeCharacteristics": "공통 눈 특징",
    "noseCharacteristics": "공통 코 특징",
    "jawline": "공통 턱선 특징",
    "overallImpression": "전체적 인상"
  },
  "gwansangInterpretation": "이 직업군의 관상학적 공통 특징을 한자를 섞어 진지하게 서술한 2-3문장"
}`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const parsed = JSON.parse(response.text ?? "{}");

  return {
    id: config.id,
    nameKo: config.nameKo,
    featureVector: parsed.featureVector || [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    commonFeatures: parsed.commonFeatures || {},
    gwansangInterpretation: parsed.gwansangInterpretation || "",
    imageCount: imageBase64s.length,
    method: "image_analysis",
  };
}

async function extractFeaturesFromText(config: OccupationConfig): Promise<OccupationFeatures> {
  console.log(`  🧠 Gemini 텍스트 추론 (이미지 없이)...`);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `당신은 동양 관상학 전문가입니다. 한국에서 ${config.nameKo}(으)로 성공한 사람들의 전형적인 얼굴 특징을 분석해주세요.

실제 한국의 유명한 ${config.nameKo}들(공인들)을 떠올리며, 그들의 공통적 얼굴 특징을 아래 JSON으로 응답하세요.

{
  "featureVector": [0.0~1.0 사이의 숫자 10개 - 순서: 얼굴너비비율, 눈사이거리비율, 이마높이비율, 코너비비율, 입풍만도, 턱각도, 광대돌출도, 얼굴대칭도, 눈크기, 턱형태],
  "commonFeatures": {
    "faceShape": "공통 얼굴형",
    "eyeCharacteristics": "공통 눈 특징",
    "noseCharacteristics": "공통 코 특징",
    "jawline": "공통 턱선 특징",
    "overallImpression": "전체적 인상"
  },
  "gwansangInterpretation": "이 직업군의 관상학적 공통 특징을 한자를 섞어 진지하게 서술한 2-3문장"
}`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const parsed = JSON.parse(response.text ?? "{}");

  return {
    id: config.id,
    nameKo: config.nameKo,
    featureVector: parsed.featureVector || [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    commonFeatures: parsed.commonFeatures || {},
    gwansangInterpretation: parsed.gwansangInterpretation || "",
    imageCount: 0,
    method: "text_inference",
  };
}

// ─── Step 4: Gemini Image로 대표 평균 얼굴 생성 ───

async function generateAverageFace(
  config: OccupationConfig,
  features: OccupationFeatures
): Promise<string | null> {
  console.log(`  🎨 대표 평균 얼굴 이미지 생성 중...`);

  const featureDesc = features.commonFeatures;
  const prompt = `Generate a single professional headshot portrait of a fictional Korean ${config.nameKo} in their 30s.

Facial features to reflect:
- Face shape: ${featureDesc.faceShape || "average Korean face"}
- Eyes: ${featureDesc.eyeCharacteristics || "average"}
- Nose: ${featureDesc.noseCharacteristics || "average"}
- Jawline: ${featureDesc.jawline || "average"}
- Overall: ${featureDesc.overallImpression || "professional"}

Style: Clean studio portrait, neutral light gray background, professional attire appropriate for a ${config.nameKo}.
This is a completely fictional person. Semi-realistic illustrated style.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseModalities: ["image", "text"],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
      }
    }
  } catch (e) {
    console.log(`  ⚠️  이미지 생성 실패 (Tier 1):`, (e as Error).message);
  }

  // Tier 2: Simpler prompt
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Draw an illustrated portrait of a fictional Korean person in their 30s who works as a ${config.nameKo}.
Semi-realistic Korean manhwa style, clean background, professional look.
This is entirely fictional, not based on any real person.`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["image", "text"],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
      }
    }
  } catch (e) {
    console.log(`  ⚠️  이미지 생성 실패 (Tier 2):`, (e as Error).message);
  }

  return null;
}

// ─── Main ───

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  제미나이 돌잡이 — 직업별 평균 얼굴 데이터 생성");
  console.log("═══════════════════════════════════════════════\n");

  // Ensure output dir
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const hasCSE = !!(CSE_ID && CSE_API_KEY);
  if (!hasCSE) {
    console.log("⚠️  Google Custom Search API 키가 없습니다.");
    console.log("   → Gemini 텍스트 추론 모드로 진행합니다.\n");
    console.log("   이미지 검색을 사용하려면 .env.local에 추가:");
    console.log("   GOOGLE_CSE_ID=your_cse_id");
    console.log("   GOOGLE_CSE_API_KEY=your_api_key\n");
  }

  for (const config of OCCUPATIONS) {
    console.log(`\n── ${config.nameKo} (${config.id}) ──────────────────`);

    let features: OccupationFeatures;

    if (hasCSE) {
      // Step 1: 이미지 수집
      const imageUrls = await collectImagesForOccupation(config);
      console.log(`  📷 수집된 이미지 URL: ${imageUrls.length}개`);

      // Step 2: 이미지 다운로드
      const base64Images: string[] = [];
      for (const url of imageUrls.slice(0, 15)) {
        const b64 = await downloadImageAsBase64(url);
        if (b64) base64Images.push(b64);
      }
      console.log(`  📥 다운로드 성공: ${base64Images.length}개`);

      // Step 3: 특징 추출
      if (base64Images.length >= 3) {
        features = await extractFeaturesFromImages(config, base64Images);
      } else {
        console.log(`  ⚠️  이미지 부족, 텍스트 추론으로 전환`);
        features = await extractFeaturesFromText(config);
      }
    } else {
      // No CSE: 텍스트 추론만
      features = await extractFeaturesFromText(config);
    }

    // Step 4: 결과 JSON 저장
    const jsonPath = path.join(OUTPUT_DIR, `${config.id}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(features, null, 2), "utf-8");
    console.log(`  💾 저장: ${jsonPath}`);

    // Step 5: 대표 평균 얼굴 이미지 생성
    const faceBase64 = await generateAverageFace(config, features);
    if (faceBase64) {
      const imgPath = path.join(OUTPUT_DIR, `${config.id}-face.png`);
      fs.writeFileSync(imgPath, Buffer.from(faceBase64, "base64"));
      console.log(`  🖼️  저장: ${imgPath}`);
    } else {
      console.log(`  ⚠️  평균 얼굴 이미지 생성 실패 — 수동 추가 필요`);
    }

    // Rate limit
    await sleep(2000);
  }

  // Step 6: occupations.ts 업데이트 스크립트
  console.log("\n\n── occupations.ts 업데이트 ──────────────────");
  updateOccupationsFile();

  console.log("\n✅ 완료!");
  console.log("   생성된 파일들: public/data/occupations/");
  console.log("   업데이트된 파일: src/data/occupations.ts\n");
}

function updateOccupationsFile() {
  const occupationsPath = path.resolve(__dirname, "../src/data/occupations.ts");

  for (const config of OCCUPATIONS) {
    const jsonPath = path.join(OUTPUT_DIR, `${config.id}.json`);
    if (!fs.existsSync(jsonPath)) continue;

    const data: OccupationFeatures = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    console.log(
      `  ${config.nameKo}: vector=[${data.featureVector.map((v) => v.toFixed(2)).join(", ")}] (${data.method})`
    );
  }

  console.log("\n  ℹ️  occupations.ts의 featureVector를 위 값으로 수동 업데이트하거나,");
  console.log("     런타임에 JSON 파일에서 동적으로 로드하도록 변경하세요.");
}

main().catch((e) => {
  console.error("❌ 에러:", e);
  process.exit(1);
});
