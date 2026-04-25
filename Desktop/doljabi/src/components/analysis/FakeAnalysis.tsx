"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import FaceLandmarks, { type FaceMeasurements } from "./FaceLandmarks";
import TerminalLog from "./TerminalLog";
import ProgressBar from "./ProgressBar";
import { useSessionStore } from "@/store/session";
import { analyzeBabyFace, generateGwansangText, generateAgedFace } from "@/lib/gemini-client";
import { matchOccupations } from "@/lib/matching-client";

interface FakeAnalysisProps {
  onComplete: () => void;
}

const STEPS = {
  INIT: { progress: 5, label: "MediaPipe Face Landmarker 초기화..." },
  LANDMARKS_DONE: { progress: 15, label: "478개 랜드마크 감지 완료" },
  FACE_ANALYZING: { progress: 25, label: "Gemini Vision 얼굴 분석 중..." },
  FACE_DONE: { progress: 40, label: "얼굴 특징 벡터 추출 완료" },
  MATCHING: { progress: 50, label: "직업 현역자 184,392명과 대조 중..." },
  STALL: { progress: 58, label: "⚠️ 비범한 관상 감지... 정밀 재분석 중" },
  GWANSANG: { progress: 65, label: "관상학적 근거 생성 중..." },
  IMAGE_GEN: { progress: 75, label: "10세 / 20세 / 30세 얼굴 생성 중..." },
  IMAGE_DONE: { progress: 95, label: "노화 시뮬레이션 완료" },
  COMPLETE: { progress: 100, label: "✓ 분석 완료" },
};

export default function FakeAnalysis({ onComplete }: FakeAnalysisProps) {
  const [isActive, setIsActive] = useState(false);
  const [measurements, setMeasurements] = useState<FaceMeasurements | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("관상 분석 준비 중...");
  const [isStalled, setIsStalled] = useState(false);
  const [apiDone, setApiDone] = useState(false);
  const babyImage = useSessionStore((s) => s.babyImage);
  const gender = useSessionStore((s) => s.gender);
  const setAnalysisResult = useSessionStore((s) => s.setAnalysisResult);
  const setGeneratedFace = useSessionStore((s) => s.setGeneratedFace);
  const analysisStarted = useRef(false);

  const updateProgress = (step: { progress: number; label: string }) => {
    setProgress(step.progress);
    setProgressLabel(step.label);
    setIsStalled(step === STEPS.STALL);
  };

  useEffect(() => {
    setIsActive(true);
    updateProgress(STEPS.INIT);
  }, []);

  const handleMeasurements = useCallback((m: FaceMeasurements) => {
    setMeasurements(m);
    updateProgress(STEPS.LANDMARKS_DONE);

    if (analysisStarted.current) return;
    analysisStarted.current = true;
    if (!babyImage) return;

    (async () => {
      try {
        // Step 1: Gemini 얼굴 분석
        updateProgress(STEPS.FACE_ANALYZING);
        const analysis = await analyzeBabyFace(babyImage);
        updateProgress(STEPS.FACE_DONE);

        // Step 2: 직업 매칭
        updateProgress(STEPS.MATCHING);
        const matches = matchOccupations(analysis.featureVector);
        const topMatch = matches[0];

        // Step 3: 73% 멈춤 연출
        updateProgress(STEPS.STALL);
        await new Promise((r) => setTimeout(r, 3000));

        // Step 4: 관상학 텍스트 생성
        updateProgress(STEPS.GWANSANG);
        const gwansangText = await generateGwansangText(
          topMatch.occupation.nameKo,
          analysis.faceDescription,
          topMatch.percentage,
          topMatch.occupation.gwansangKeywords
        );

        setAnalysisResult({
          topOccupation: topMatch,
          allMatches: matches,
          gwansangText,
          faceDescription: analysis.faceDescription,
          featureVector: analysis.featureVector,
        });

        // Step 5: 이미지 생성 (병렬, 분석 화면에서 진행)
        updateProgress(STEPS.IMAGE_GEN);

        const ages = [10, 20, 40];
        await Promise.all(
          ages.map(async (age) => {
            const result = await generateAgedFace(
              babyImage,
              age,
              topMatch.occupation.nameKo,
              analysis.faceDescription,
              gender
            );
            if (result) {
              setGeneratedFace(age, result);
            }
          })
        );

        updateProgress(STEPS.IMAGE_DONE);
        await new Promise((r) => setTimeout(r, 500));
        updateProgress(STEPS.COMPLETE);
        setApiDone(true);
      } catch (e) {
        console.error("Analysis error:", e);
        updateProgress(STEPS.COMPLETE);
        setApiDone(true);
      }
    })();
  }, [babyImage, setAnalysisResult, setGeneratedFace]);

  useEffect(() => {
    if (apiDone) {
      const timeout = setTimeout(onComplete, 1500);
      return () => clearTimeout(timeout);
    }
  }, [apiDone, onComplete]);

  if (!babyImage) return null;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-6 px-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-amber-400 animate-pulse">
          관상 분석 진행 중
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Gemini 관상학 엔진 + MediaPipe Face Landmarker
        </p>
      </div>

      <FaceLandmarks
        imageUrl={babyImage}
        isActive={isActive}
        onMeasurements={handleMeasurements}
      />

      <TerminalLog isActive={isActive} measurements={measurements} />

      <ProgressBar
        progress={progress}
        label={progressLabel}
        isStalled={isStalled}
      />
    </div>
  );
}
