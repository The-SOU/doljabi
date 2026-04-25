"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSessionStore } from "@/store/session";

export default function SharePanel() {
  const [copied, setCopied] = useState(false);
  const analysisResult = useSessionStore((s) => s.analysisResult);
  const reset = useSessionStore((s) => s.reset);

  if (!analysisResult) return null;

  const { topOccupation } = analysisResult;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "제미나이 돌잡이 결과",
          text: `우리 아기는 30년 후 ${topOccupation.occupation.nameKo}! (일치율 ${topOccupation.percentage}%) - 제미나이 돌잡이`,
          url: window.location.origin,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleRetry = () => {
    reset();
    window.location.href = "/";
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      {/* Result summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-8 text-center mb-8"
      >
        <div className="text-6xl mb-4">{topOccupation.occupation.emoji}</div>
        <h2 className="text-2xl font-black text-white mb-2">
          30년 후 예상 직업
        </h2>
        <p className="text-4xl font-black text-amber-400 mb-2">
          {topOccupation.occupation.nameKo}
        </p>
        <p className="text-gray-400">
          일치율 {topOccupation.percentage}%
        </p>
      </motion.div>

      {/* Share buttons */}
      <div className="space-y-3">
        <button
          onClick={handleShare}
          className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition active:scale-95 text-lg"
        >
          결과 공유하기
        </button>

        <button
          onClick={handleCopyLink}
          className="w-full py-3 bg-gray-800 text-gray-300 font-medium rounded-xl hover:bg-gray-700 transition active:scale-95"
        >
          {copied ? "✓ 복사됨!" : "링크 복사하기"}
        </button>

        <button
          onClick={handleRetry}
          className="w-full py-3 bg-gray-900 text-gray-500 font-medium rounded-xl hover:bg-gray-800 hover:text-gray-400 transition active:scale-95"
        >
          다시 하기
        </button>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-gray-700 text-center mt-8 leading-relaxed">
        &ldquo;쓸모없는 AI 만들기&rdquo; 해커톤 출품작
        <br />
        Powered by Google Gemini
      </p>
    </div>
  );
}
