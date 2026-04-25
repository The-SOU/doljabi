import type { FaceMeasurements } from "@/components/analysis/FaceLandmarks";

// 실제 측정값 도착 전에 보여줄 초기 로그
export const initialLogLines: string[] = [
  "[ INIT ] Gemini 관상학 엔진 v2.7.3 부팅 중...",
  "[ LOAD ] 동양 관상학 데이터베이스 로딩... 완료 (1,247종 상법 수록)",
  "[ SCAN ] MediaPipe Face Landmarker 초기화...",
  "[ SCAN ] GPU 가속 모드 활성화...",
  "[ SCAN ] 안면 478개 3D 랜드마크 감지 시작...",
];

// 실제 측정값이 들어오면 그걸로 생성하는 로그
export function generateMeasurementLogs(m: FaceMeasurements): string[] {
  return [
    `[ DATA ] 랜드마크 ${m.landmarkCount}개 감지 완료 ✓`,
    `[ DATA ] 삼정(三停) 비율 분석... 이마 ${m.foreheadRatio}% / 코 ${m.noseRatio}% / 턱 ${m.chinRatio}%`,
    `[ DATA ] 황금비(1.618) 대비 편차... ${m.goldenRatioDeviation.toFixed(3)} ${m.goldenRatioDeviation < 0.1 ? "(근접!)" : ""}`,
    `[ DATA ] 얼굴 대칭도 측정... ${m.faceSymmetry.toFixed(1)}% ${m.faceSymmetry > 85 ? "(상위 12%)" : ""}`,
    `[ DATA ] 인당(印堂) 폭 측정 중... ${m.eyeDistance.toFixed(1)}px`,
    `[ DATA ] 관골(觀骨) 돌출도... ${m.cheekboneProminence.toFixed(1)}%`,
    `[ DATA ] 하관(下關) 각도 분석 중... ${m.jawAngle.toFixed(1)}°`,
    `[ DATA ] 입꼬리 각도 측정... ${m.mouthCornerAngle.toFixed(1)}° ${m.mouthCornerAngle > 0 ? "(상승형 — 복상)" : "(하강형 — 고상)"}`,
    `[ DATA ] 준두(準頭) 길이... ${m.noseLength.toFixed(1)}px`,
    `[ WARN ] ⚠️ 비범한 기상(氣象) 감지됨`,
    "[ LOAD ] 2055년 한국 노동시장 데이터베이스 로딩 중...",
    "[ PROC ] 직업 현역자 184,392명 얼굴 데이터와 대조 중...",
    "[ PROC ] 코사인 유사도 매트릭스 생성 중... (1408차원 벡터 공간)",
    "[ PROC ] 관상학적 적성 매칭 알고리즘 실행 중...",
    "[ WARN ] ⚠️ 특이 패턴 발견 — 정밀 재분석 필요",
    "[ PROC ] 30년 후 안면 노화 시뮬레이션 가동...",
    "[ PROC ] 최종 직업 적합도 암호화 중... [AES-256-GCM]",
    "[ DONE ] 분석 완료. 결과 생성 중...",
  ];
}
