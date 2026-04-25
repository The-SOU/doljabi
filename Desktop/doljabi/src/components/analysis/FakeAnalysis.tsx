"use client";

import { useState, useEffect, useCallback } from "react";
import FaceLandmarks from "./FaceLandmarks";
import TerminalLog from "./TerminalLog";
import ProgressBar from "./ProgressBar";
import { useSessionStore } from "@/store/session";
import { analyzeBabyFace, generateGwansangText } from "@/lib/gemini-client";
import { matchOccupations } from "@/lib/matching-client";

interface FakeAnalysisProps {
  onComplete: () => void;
}

export default function FakeAnalysis({ onComplete }: FakeAnalysisProps) {
  const [isActive, setIsActive] = useState(false);
  const [progressDone, setProgressDone] = useState(false);
  const [apiDone, setApiDone] = useState(false);
  const babyImage = useSessionStore((s) => s.babyImage);
  const setAnalysisResult = useSessionStore((s) => s.setAnalysisResult);

  // Start everything on mount
  useEffect(() => {
    setIsActive(true);

    // Fire real Gemini API call directly from client
    if (babyImage) {
      (async () => {
        try {
          const analysis = await analyzeBabyFace(babyImage);
          const matches = matchOccupations(analysis.featureVector);
          const topMatch = matches[0];

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
        } catch (e) {
          console.error("Analysis error:", e);
        } finally {
          setApiDone(true);
        }
      })();
    }
  }, [babyImage, setAnalysisResult]);

  // Transition when both animation and API are done
  useEffect(() => {
    if (progressDone && apiDone) {
      const timeout = setTimeout(onComplete, 1000);
      return () => clearTimeout(timeout);
    }
  }, [progressDone, apiDone, onComplete]);

  const handleProgressComplete = useCallback(() => {
    setProgressDone(true);
  }, []);

  if (!babyImage) return null;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-6 px-4">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-amber-400 animate-pulse">
          관상 분석 진행 중
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Gemini 관상학 엔진이 열일하고 있습니다...
        </p>
      </div>

      {/* Face with landmarks */}
      <FaceLandmarks imageUrl={babyImage} isActive={isActive} />

      {/* Terminal log */}
      <TerminalLog isActive={isActive} />

      {/* Progress bar */}
      <ProgressBar isActive={isActive} onComplete={handleProgressComplete} />
    </div>
  );
}
