import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface FaceAnalysisResult {
  featureVector: number[];
  faceDescription: string;
}

export async function analyzeBabyFace(imageBase64: string): Promise<FaceAnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
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
            text: `당신은 동양 관상학(觀相學) 최고 권위자입니다. 매우 진지하고 학술적인 톤으로 작성해주세요.

아기의 얼굴 분석 결과: ${faceDescription}
매칭된 직업: ${occupationName} (일치율: ${matchPercentage}%)
관상학 키워드: ${gwansangKeywords.join(", ")}

위 정보를 바탕으로, 이 아기가 왜 30년 후에 ${occupationName}이/가 될 수밖에 없는지를 관상학적 근거로 서술해주세요.

규칙:
1. 반드시 한자(漢字)를 괄호 안에 섞어서 사용할 것
2. 관상학 용어를 최소 3개 이상 포함할 것 (예: 천정, 인당, 준두, 와잠, 관골, 오악, 관록궁, 복덕방 등)
3. 3-4문장으로 작성할 것
4. 매우 진지하고 권위적인 톤을 유지하되, 내용은 황당할수록 좋음
5. 마지막에 "...하는 상(相)이니, ${occupationName}의 길은 이미 정해진 것이라 하겠다." 형식으로 마무리할 것`,
          },
        ],
      },
    ],
  });

  return response.text ?? "";
}

export async function generateTimeline(
  occupationName: string,
  occupationId: string
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

export interface TimelineEvent {
  year: number;
  age: number;
  headline: string;
  newspaper: string;
  reporter: string;
  body: string;
}

export async function generateAgedFace(
  babyImageBase64: string,
  targetAge: number,
  occupation: string,
  faceDescription: string
): Promise<string | null> {
  try {
    // Tier 1: With baby photo reference
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: babyImageBase64,
              },
            },
            {
              text: `이 아기의 얼굴 특징을 참고하여, ${targetAge}세가 된 한국인의 증명사진 스타일 초상화를 그려주세요.
특징: ${faceDescription}
${targetAge >= 25 ? `직업: ${occupation}. 해당 직업에 어울리는 복장과 분위기.` : ""}
스타일: 반실사 일러스트레이션, 깔끔한 배경, 정면 얼굴`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["image", "text"],
      },
    });

    // Extract image from response
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
      }
    }
    return null;
  } catch {
    // Tier 2: Without baby photo, text-only prompt
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${targetAge}세 한국인의 증명사진 스타일 초상화를 그려주세요.
얼굴 특징: ${faceDescription}
${targetAge >= 25 ? `직업: ${occupation}. 해당 직업에 어울리는 복장.` : ""}
스타일: 반실사 일러스트레이션, 깔끔한 배경, 정면 얼굴. 가상의 인물입니다.`,
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
      return null;
    } catch {
      return null;
    }
  }
}
