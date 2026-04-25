"use client";

import { useState, useEffect } from "react";

interface ProgressBarProps {
  isActive: boolean;
  onComplete?: () => void;
}

export default function ProgressBar({ isActive, onComplete }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("관상 분석 준비 중...");

  useEffect(() => {
    if (!isActive) return;

    // Phase 1: 0 to 73% over 8 seconds
    // Phase 2: stall at 73% for 3 seconds
    // Phase 3: 73% to 100% over 2 seconds
    const startTime = Date.now();

    const update = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      if (elapsed < 8) {
        // Phase 1: smooth climb to 73%
        const p = (elapsed / 8) * 73;
        setProgress(p);
        if (elapsed < 3) setLabel("안면 구조 스캔 중...");
        else if (elapsed < 6) setLabel("관상학 데이터베이스 대조 중...");
        else setLabel("직업 적합도 계산 중...");
      } else if (elapsed < 11) {
        // Phase 2: stall at 73%
        setProgress(73);
        setLabel("⚠️ 비범한 관상 감지... 정밀 재분석 중");
      } else if (elapsed < 13) {
        // Phase 3: 73% to 100%
        const p = 73 + ((elapsed - 11) / 2) * 27;
        setProgress(Math.min(100, p));
        setLabel("최종 결과 생성 중...");
      } else {
        setProgress(100);
        setLabel("✓ 분석 완료");
        onComplete?.();
        return;
      }

      requestAnimationFrame(update);
    };

    const frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [isActive, onComplete]);

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-100 ease-linear"
          style={{
            width: `${progress}%`,
            background:
              progress === 73
                ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                : progress >= 100
                ? "linear-gradient(90deg, #22c55e, #10b981)"
                : "linear-gradient(90deg, #f59e0b, #f97316)",
          }}
        />
      </div>

      {/* Label */}
      <div className="flex justify-between items-center mt-2">
        <span
          className={`text-xs ${
            progress === 73
              ? "text-red-400 animate-pulse"
              : progress >= 100
              ? "text-green-400"
              : "text-gray-400"
          }`}
        >
          {label}
        </span>
        <span className="text-xs text-gray-500 font-mono">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
