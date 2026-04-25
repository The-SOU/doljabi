"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/store/session";
import PhotoUpload from "@/components/upload/PhotoUpload";
import FakeAnalysis from "@/components/analysis/FakeAnalysis";
import FaceReveal from "@/components/reveal/FaceReveal";
import CareerVerdict from "@/components/verdict/CareerVerdict";
import SharePanel from "@/components/share/SharePanel";

export default function Home() {
  const currentAct = useSessionStore((s) => s.currentAct);
  const setCurrentAct = useSessionStore((s) => s.setCurrentAct);

  const goToAct2 = useCallback(() => setCurrentAct(2), [setCurrentAct]);
  const goToAct3 = useCallback(() => setCurrentAct(3), [setCurrentAct]);
  const goToAct5 = useCallback(() => setCurrentAct(5), [setCurrentAct]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <AnimatePresence mode="wait">
        {/* Act 0: 랜딩 + 업로드 */}
        {currentAct === 0 && (
          <motion.div
            key="act0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-lg mx-auto px-6 py-12 flex flex-col items-center">
              {/* [1] 타이틀 */}
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Google Doljabi
              </h1>

              {/* [2] 한 줄 카피 */}
              <p className="mt-4 text-gray-200 text-base md:text-lg text-center font-medium">
                AI가 당신의 아기 얼굴에서 30년 후를 읽어냅니다
              </p>

              {/* [3] 보조 설명 */}
              <p className="mt-2 text-gray-500 text-xs text-center">
                사진 한 장으로 미래 직업 · 얼굴 · 커리어를 예측합니다
              </p>

              {/* [4] 신뢰 시그널 */}
              <div className="mt-3 text-[10px] text-gray-600 text-center">
                Powered by Gemini · Doljabi AI v2.7
              </div>

              {/* 구분선 */}
              <div className="w-full max-w-xs border-t border-gray-800 my-8" />

              {/* [5] 업로드 + [6] 성별 + [7] 예시 */}
              <PhotoUpload />

              {/* [8] 디스클레이머 */}
              <p className="mt-10 text-[9px] text-gray-700 text-center leading-relaxed">
                본 서비스는 엔터테인먼트 목적으로 제작되었으며 AI의 분석 결과는 과학적 근거가 없습니다.
                <br />
                &ldquo;쓸모없는 AI 만들기&rdquo; 해커톤 출품작 · v2.2.0
              </p>
            </div>
          </motion.div>
        )}

        {/* Act 1: 분석 */}
        {currentAct === 1 && (
          <motion.div
            key="act1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="py-8 md:py-12"
          >
            <FakeAnalysis onComplete={goToAct2} />
          </motion.div>
        )}

        {/* Act 2: 얼굴 공개 */}
        {currentAct === 2 && (
          <motion.div
            key="act2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="py-8 md:py-12"
          >
            <FaceReveal onComplete={goToAct3} />
          </motion.div>
        )}

        {/* Act 3: 직업 판정 + 타임라인 */}
        {currentAct === 3 && (
          <motion.div
            key="act3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="py-8 md:py-12"
          >
            <CareerVerdict onComplete={goToAct5} />
          </motion.div>
        )}

        {/* Act 5: 공유 */}
        {currentAct === 5 && (
          <motion.div
            key="act5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="py-8 md:py-12"
          >
            <SharePanel />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
