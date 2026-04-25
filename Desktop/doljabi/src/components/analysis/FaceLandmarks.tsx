"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaceLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

interface FaceLandmarksProps {
  imageUrl: string;
  isActive: boolean;
  onMeasurements?: (measurements: FaceMeasurements) => void;
}

export interface FaceMeasurements {
  goldenRatioDeviation: number;  // 황금비 대비 편차
  faceSymmetry: number;          // 얼굴 대칭도 (0-100)
  foreheadRatio: number;         // 삼정 이마 비율
  noseRatio: number;             // 삼정 코 비율
  chinRatio: number;             // 삼정 턱 비율
  eyeDistance: number;           // 인당 폭 (px)
  jawAngle: number;              // 턱 각도
  cheekboneProminence: number;   // 광대 돌출도
  mouthCornerAngle: number;      // 입꼬리 각도
  noseLength: number;            // 코 길이
  landmarkCount: number;         // 감지된 랜드마크 수
}

// MediaPipe Face Landmarker connections for drawing
const FACE_OVAL = [
  [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389],
  [389, 356], [356, 454], [454, 323], [323, 361], [361, 288], [288, 397],
  [397, 365], [365, 379], [379, 378], [378, 400], [400, 377], [377, 152],
  [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172],
  [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162],
  [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10],
];

const LEFT_EYE = [
  [33, 7], [7, 163], [163, 144], [144, 145], [145, 153], [153, 154],
  [154, 155], [155, 133], [133, 173], [173, 157], [157, 158], [158, 159],
  [159, 160], [160, 161], [161, 246], [246, 33],
];

const RIGHT_EYE = [
  [362, 382], [382, 381], [381, 380], [380, 374], [374, 373], [373, 390],
  [390, 249], [249, 263], [263, 466], [466, 388], [388, 387], [387, 386],
  [386, 385], [385, 384], [384, 398], [398, 362],
];

const LIPS = [
  [61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314],
  [314, 405], [405, 321], [321, 375], [375, 291], [291, 409], [409, 270],
  [270, 269], [269, 267], [267, 0], [0, 37], [37, 39], [39, 40],
  [40, 185], [185, 61],
];

const NOSE = [
  [168, 6], [6, 197], [197, 195], [195, 5], [5, 4],
  [4, 1], [1, 19], [19, 94], [94, 2],
];

const LEFT_EYEBROW = [
  [46, 53], [53, 52], [52, 65], [65, 55], [55, 107], [107, 66], [66, 105], [105, 63], [63, 70],
];

const RIGHT_EYEBROW = [
  [276, 283], [283, 282], [282, 295], [295, 285], [285, 336], [336, 296], [296, 334], [334, 293], [293, 300],
];

function computeMeasurements(
  landmarks: { x: number; y: number; z: number }[],
  imgWidth: number,
  imgHeight: number
): FaceMeasurements {
  const px = (i: number) => landmarks[i].x * imgWidth;
  const py = (i: number) => landmarks[i].y * imgHeight;
  const dist = (i: number, j: number) =>
    Math.sqrt((px(i) - px(j)) ** 2 + (py(i) - py(j)) ** 2);

  // 삼정(三停) — 이마(10→6), 코(6→2), 턱(2→152)
  const foreheadLen = dist(10, 6);
  const noseLen = dist(6, 2);
  const chinLen = dist(2, 152);
  const totalFace = foreheadLen + noseLen + chinLen;

  // 황금비 편차 — 얼굴 높이/너비
  const faceHeight = dist(10, 152);
  const faceWidth = dist(234, 454);
  const ratio = faceHeight / (faceWidth || 1);
  const goldenRatioDeviation = Math.abs(ratio - 1.618);

  // 대칭도 — 좌우 대칭 점 쌍 비교
  const symPairs = [[33, 263], [133, 362], [70, 300], [105, 334], [58, 288], [132, 361]];
  const midX = px(1); // 코끝 중심
  let symScore = 0;
  for (const [l, r] of symPairs) {
    const leftDist = Math.abs(px(l) - midX);
    const rightDist = Math.abs(px(r) - midX);
    symScore += 1 - Math.abs(leftDist - rightDist) / (Math.max(leftDist, rightDist) || 1);
  }
  const faceSymmetry = (symScore / symPairs.length) * 100;

  // 인당 폭 (양 눈 안쪽 거리)
  const eyeDistance = dist(133, 362);

  // 턱 각도
  const jawLeft = Math.atan2(py(152) - py(234), px(152) - px(234));
  const jawRight = Math.atan2(py(152) - py(454), px(152) - px(454));
  const jawAngle = ((jawRight - jawLeft) * 180) / Math.PI;

  // 광대 돌출도 — 광대뼈 너비 vs 턱 너비
  const cheekWidth = dist(234, 454);
  const jawWidth = dist(172, 397);
  const cheekboneProminence = ((cheekWidth - jawWidth) / cheekWidth) * 100;

  // 입꼬리 각도
  const mouthAngle =
    (Math.atan2(py(291) - py(61), px(291) - px(61)) * 180) / Math.PI;

  return {
    goldenRatioDeviation: Math.round(goldenRatioDeviation * 1000) / 1000,
    faceSymmetry: Math.round(faceSymmetry * 10) / 10,
    foreheadRatio: Math.round((foreheadLen / totalFace) * 100 * 10) / 10,
    noseRatio: Math.round((noseLen / totalFace) * 100 * 10) / 10,
    chinRatio: Math.round((chinLen / totalFace) * 100 * 10) / 10,
    eyeDistance: Math.round(eyeDistance * 10) / 10,
    jawAngle: Math.round(jawAngle * 10) / 10,
    cheekboneProminence: Math.round(cheekboneProminence * 10) / 10,
    mouthCornerAngle: Math.round(mouthAngle * 10) / 10,
    noseLength: Math.round(noseLen * 10) / 10,
    landmarkCount: landmarks.length,
  };
}

export default function FaceLandmarks({ imageUrl, isActive, onMeasurements }: FaceLandmarksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const animFrameRef = useRef<number>(0);
  const [realLandmarks, setRealLandmarks] = useState<{ x: number; y: number; z: number }[] | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);

  // Initialize MediaPipe
  useEffect(() => {
    if (!isActive) return;

    let cancelled = false;

    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "IMAGE",
          numFaces: 1,
          outputFaceBlendshapes: true,
        });

        if (cancelled) return;
        landmarkerRef.current = landmarker;

        // Detect face in image
        if (imgRef.current && imgRef.current.complete) {
          runDetection(landmarker);
        }
      } catch (e) {
        console.error("MediaPipe init error:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isActive]);

  const runDetection = useCallback(
    (landmarker: FaceLandmarker) => {
      if (!imgRef.current) return;

      const result = landmarker.detect(imgRef.current);
      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const landmarks = result.faceLandmarks[0];
        setRealLandmarks(landmarks);

        // Compute real measurements
        if (imgRef.current && onMeasurements) {
          const measurements = computeMeasurements(
            landmarks,
            imgRef.current.naturalWidth,
            imgRef.current.naturalHeight
          );
          onMeasurements(measurements);
        }
      }
    },
    [onMeasurements]
  );

  // Run detection when image loads
  const handleImageLoad = useCallback(() => {
    if (landmarkerRef.current) {
      runDetection(landmarkerRef.current);
    }
  }, [runDetection]);

  // Animate landmarks
  useEffect(() => {
    if (!isActive || !canvasRef.current || !realLandmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;

    const allConnections = [
      ...FACE_OVAL, ...LEFT_EYE, ...RIGHT_EYE,
      ...LIPS, ...NOSE, ...LEFT_EYEBROW, ...RIGHT_EYEBROW,
    ];

    const totalPoints = realLandmarks.length;
    const startTime = Date.now();

    const draw = () => {
      const elapsed = Date.now() - startTime;
      // Reveal ~40 points per second (478 points in ~12 seconds)
      const pointCount = Math.min(totalPoints, Math.floor(elapsed / 25));

      ctx.clearRect(0, 0, w, h);

      // Draw connections
      ctx.strokeStyle = "rgba(34, 197, 94, 0.15)";
      ctx.lineWidth = 0.8;
      for (const [a, b] of allConnections) {
        if (a < pointCount && b < pointCount && a < totalPoints && b < totalPoints) {
          ctx.beginPath();
          ctx.moveTo(realLandmarks[a].x * w, realLandmarks[a].y * h);
          ctx.lineTo(realLandmarks[b].x * w, realLandmarks[b].y * h);
          ctx.stroke();
        }
      }

      // Draw points
      for (let i = 0; i < pointCount && i < totalPoints; i++) {
        const lm = realLandmarks[i];
        const px = lm.x * w;
        const py = lm.y * h;

        const age = elapsed - i * 25;
        const pulse = age < 300 ? 1 + Math.sin(age / 40) * 0.4 : 1;
        const radius = 1.5 * pulse;

        // Glow
        ctx.beginPath();
        ctx.arc(px, py, radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(34, 197, 94, 0.1)";
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = age < 300 ? "#4ade80" : "#22c55e";
        ctx.fill();
      }

      // Scanning line
      const scanY = (elapsed / 30) % h;
      ctx.strokeStyle = "rgba(34, 197, 94, 0.08)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();

      // Measurement annotations (show after landmarks complete)
      if (pointCount >= totalPoints && elapsed > 12500) {
        ctx.font = "10px monospace";
        ctx.fillStyle = "rgba(74, 222, 128, 0.8)";

        // Eye distance line
        const le = realLandmarks[133];
        const re = realLandmarks[362];
        ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(le.x * w, le.y * h);
        ctx.lineTo(re.x * w, re.y * h);
        ctx.stroke();
        ctx.setLineDash([]);

        // Jaw angle arc
        const jaw = realLandmarks[152];
        ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
        ctx.beginPath();
        ctx.arc(jaw.x * w, jaw.y * h, 20, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.stroke();
      }

      if (isActive) {
        animFrameRef.current = requestAnimationFrame(draw);
      }
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isActive, realLandmarks]);

  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto rounded-xl overflow-hidden">
      {/* Baby photo */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt="분석 중인 아기 사진"
        className="w-full h-full object-cover"
        crossOrigin="anonymous"
        onLoad={handleImageLoad}
      />

      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="absolute inset-0 w-full h-full"
      />

      {/* Landmark count badge */}
      {realLandmarks && (
        <div className="absolute top-2 left-2 bg-black/70 text-green-400 text-[10px] font-mono px-2 py-1 rounded">
          {realLandmarks.length} landmarks detected
        </div>
      )}

      {/* Scan frame corners */}
      <div className="absolute inset-4 pointer-events-none">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-400" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-400" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-400" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-400" />
      </div>
    </div>
  );
}
