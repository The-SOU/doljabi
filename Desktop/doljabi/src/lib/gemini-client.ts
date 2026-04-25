import { GoogleGenAI } from "@google/genai";
import type { TimelineEvent } from "./gemini";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
});

export interface FaceAnalysisResult {
  featureVector: number[];
  faceDescription: string;
}

export async function analyzeBabyFace(imageBase64: string): Promise<FaceAnalysisResult> {
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
          {
            text: `당신은 동양 관상학(觀相學) 전문가입니다. 이 아기의 얼굴 사진을 분석하여 다음 JSON 형식으로 응답해주세요.

반드시 아래 형식의 JSON만 출력하세요. 다른 텍스트는 포함하지 마세요.

{
  "featureVector": [0.0~1.0 사이의 숫자 10개 배열 - 순서대로: 얼굴너비비율, 눈사이거리비율, 이마높이비율, 코너비비율, 입풍만도, 턱각도, 광대돌출도, 얼굴대칭도, 눈크기, 턱형태],
  "faceDescription": "이 아기의 관상학적 특징을 한자를 섞어가며 진지하고 학술적으로 서술한 2-3문장. 예: '피험자의 천정(天庭)이 넓고 맑아...' 형식"
}`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "";
  const parsed = JSON.parse(text);
  return {
    featureVector: parsed.featureVector,
    faceDescription: parsed.faceDescription,
  };
}

export async function generateGwansangText(
  occupationName: string,
  faceDescription: string,
  matchPercentage: number,
  gwansangKeywords: string[]
): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `아기의 얼굴 분석 결과를 바탕으로, 이 아기가 왜 ${occupationName}이/가 될 운명인지 재미있게 설명해주세요.

얼굴 분석 결과: ${faceDescription}
매칭된 직업: ${occupationName} (일치율: ${matchPercentage}%)

규칙:
1. 딱 2문장으로 작성할 것
2. 첫 문장: 아기의 구체적인 얼굴 특징(예: 눈이 크다, 이마가 넓다, 볼이 통통하다 등)을 언급하며 그게 왜 ${occupationName}과 연결되는지 재미있고 황당한 논리로 설명
3. 두 번째 문장: "그러니까 ${occupationName}이/가 되는 건 이미 정해진 운명!" 같은 확신에 찬 마무리
4. 누구나 읽고 웃을 수 있는 쉬운 한국어로 작성. 어려운 한자나 전문 용어는 쓰지 말 것
5. 진지한 척하면서 내용은 황당해야 함`,
          },
        ],
      },
    ],
  });

  return response.text ?? "";
}

export async function generateTimeline(
  occupationName: string,
): Promise<TimelineEvent[]> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `당신은 미래 예언가입니다. 2025년에 태어난 아기가 "${occupationName}"이/가 되기까지의 30년간 주요 인생 이벤트를 가짜 신문기사 형식으로 생성해주세요.

반드시 아래 JSON 배열 형식만 출력하세요:

[
  {
    "year": 2030,
    "age": 5,
    "headline": "헤드라인 (웃기고 황당하게)",
    "newspaper": "가짜 신문사 이름 (예: AI조선일보, 한국관상신문, 미래경제)",
    "reporter": "가짜 기자 이름",
    "body": "본문 2-3줄. 진지한 톤으로 황당한 내용."
  }
]

규칙:
1. 7~8개 이벤트 생성
2. 연도는 2030, 2033, 2036, 2039, 2042, 2047, 2052, 2055 근처로 분배
3. 초반은 어린 시절 에피소드, 중반은 성장/교육, 후반은 커리어 성취
4. 마지막 이벤트는 2055년, 정점의 순간 또는 반전(예: 전혀 다른 결말)
5. 헤드라인은 실제 한국 뉴스 톤을 패러디할 것
6. 매우 진지하지만 내용이 황당해야 함
7. ${occupationName} 직업 특성을 반영한 구체적 에피소드여야 함`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "";
  return JSON.parse(text);
}

// 직업별 복장 매핑
function getOccupationAttire(occupation: string): string {
  const attireMap: Record<string, string> = {
    "의사": "white doctor's coat with stethoscope around neck, in a modern hospital",
    "변호사": "formal dark suit with tie, in a law office with bookshelves",
    "과학자": "white lab coat, in a research laboratory with equipment",
    "CEO": "premium tailored business suit, in a luxury office with city view",
    "100만 유튜버": "casual trendy streetwear, with ring light and camera setup visible behind",
    "아이돌": "glamorous K-pop idol stage outfit with sequins and glitter, colorful concert stage lighting with LED screens behind, holding a microphone, K-pop music video aesthetic, flawless skin with Korean beauty makeup",
    "축구선수": "Korean national team soccer jersey, on a soccer field",
    "셰프": "white chef's coat and tall chef hat, in a professional kitchen",
    "대통령": "formal navy suit with Korean flag pin, at a presidential podium with Korean flags",
    "판사": "black judge's robe, in a courtroom setting",
  };
  return attireMap[occupation] || "professional attire";
}

// 나이별 포토리얼 프롬프트 (성별 반영)
function getAgePrompt(targetAge: number, occupation: string, faceDescription: string, gender: string): string {
  const genderKo = gender === "male" ? "남성" : "여성";
  const genderEn = gender === "male" ? "male" : "female";
  const child = gender === "male" ? "boy" : "girl";
  const youngAdult = gender === "male" ? "young man" : "young woman";

  const ageDescriptions: Record<number, string> = {
    10: `A photorealistic portrait photo of a 10-year-old Korean ${child}.
Facial features inherited from baby: ${faceDescription}
- Round childlike face with baby fat still visible, but clearly a ${child}
- Wearing a Korean elementary school uniform
- Bright cheerful expression, school photo style
- Natural indoor lighting, clean light gray background
- Shot on Canon EOS R5, 85mm lens, f/2.8
- MUST look exactly like a real 10-year-old Korean ${child}, NOT a cartoon or illustration
- Gender: ${genderEn}
- MUST have dark brown or black iris color (Korean eyes)
- NO tattoos, NO text, NO letters, NO characters, NO watermarks on face or skin`,

    20: `A photorealistic portrait photo of a 20-year-old Korean ${youngAdult}, university student.
Facial features matured from childhood: ${faceDescription}
- Sharp defined jawline, mature facial structure of a ${youngAdult}
- Wearing casual university style clothes
- Confident youthful expression, natural smile
- Natural indoor lighting, clean light gray background
- Shot on Canon EOS R5, 85mm lens, f/2.8
- MUST look exactly like a real 20-year-old Korean ${youngAdult}, NOT a cartoon or illustration
- Gender: ${genderEn}
- MUST have dark brown or black iris color (Korean eyes)
- NO tattoos, NO text, NO letters, NO characters, NO watermarks on face or skin`,

    30: `A photorealistic portrait photo of a 30-year-old Korean ${genderEn} professional ${occupation}.
Facial features matured: ${faceDescription}
- Young adult ${genderEn} face in early 30s, still youthful but more mature than 20s
- Slightly more defined features than 20s, but no wrinkles or aging signs
- ${getOccupationAttire(occupation)}
- Confident expression befitting a successful young ${occupation}
- Professional photography lighting
- Shot on Canon EOS R5, 85mm lens, f/2.8
- MUST look exactly like a real 30-year-old Korean ${genderKo} ${occupation}, NOT a cartoon or illustration
- The person should look young, in their early 30s — older than 20 but still youthful
- Gender: ${genderEn}
- MUST have dark brown or black iris color (Korean eyes)
- NO tattoos, NO text, NO letters, NO characters, NO watermarks on face or skin`,
  };

  return ageDescriptions[targetAge] || ageDescriptions[30];
}

export async function generateAgedFace(
  babyImageBase64: string,
  targetAge: number,
  occupation: string,
  faceDescription: string,
  gender: string = "male"
): Promise<string | null> {
  const prompt = getAgePrompt(targetAge, occupation, faceDescription, gender);

  try {
    console.log(`[generateAgedFace] ${targetAge}세 Imagen 4 생성 시작`);
    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt,
      config: {
        numberOfImages: 1,
      },
    });

    if (response.generatedImages?.[0]?.image?.imageBytes) {
      console.log(`[generateAgedFace] ${targetAge}세 성공`);
      return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
    }

    console.warn(`[generateAgedFace] ${targetAge}세 응답에 이미지 없음`);
    return null;
  } catch (err) {
    console.error(`[generateAgedFace] ${targetAge}세 Imagen 4 실패:`, err);
    return null;
  }
}
