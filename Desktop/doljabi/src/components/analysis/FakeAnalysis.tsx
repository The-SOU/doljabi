"use client";

import { useState, useEffect, useCallback } from "react";
import FaceLandmarks from "./FaceLandmarks";
import TerminalLog from "./TerminalLog";
import ProgressBar from "./ProgressBar";
import { useSessionStore } from "@/store/session";

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

    // Fire real API call
    if (babyImage) {
      fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: babyImage }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setAnalysisResult({
              topOccupation: data.topOccupation,
              allMatches: data.allMatches,
              gwansangText: data.gwansangText,
              faceDescription: data.faceDescription,
              featureVector: data.featureVector,
            });
          }
          setApiDone(true);
        })
        .catch(() => setApiDone(true));
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
