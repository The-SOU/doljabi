"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/store/session";
import PhotoUpload from "@/components/upload/PhotoUpload";
import FakeAnalysis from "@/components/analysis/FakeAnalysis";
import FaceReveal from "@/components/reveal/FaceReveal";
import CareerVerdict from "@/components/verdict/CareerVerdict";
import CareerTimeline from "@/components/timeline/CareerTimeline";
import SharePanel from "@/components/share/SharePanel";

export default function Home() {
  const currentAct = useSessionStore((s) => s.currentAct);
  const setCurrentAct = useSessionStore((s) => s.setCurrentAct);

  const goToAct2 = useCallback(() => setCurrentAct(2), [setCurrentAct]);
  const goToAct3 = useCallback(() => setCurrentAct(3), [setCurrentAct]);
  const goToAct4 = useCallback(() => setCurrentAct(4), [setCurrentAct]);
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
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  제미나이 돌잡이
                </h1>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  AI 관상학으로 보는 우리 아이의 30년 후
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
                  <span className="px-2 py-1 bg-gray-800 rounded-full">Powered by Gemini</span>
                  <span className="px-2 py-1 bg-gray-800 rounded-full">관상학 v2.7</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3 mb-10 w-full">
                {[
                  { emoji: "🩺", name: "의사" },
                  { emoji: "⚖️", name: "변호사" },
                  { emoji: "🔬", name: "과학자" },
                  { emoji: "💼", name: "CEO" },
                  { emoji: "🎬", name: "유튜버" },
                  { emoji: "🎤", name: "아이돌" },
                  { emoji: "⚽", name: "축구선수" },
                  { emoji: "👨‍🍳", name: "셰프" },
                  { emoji: "🏛️", name: "대통령" },
                  { emoji: "🔨", name: "판사" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-800/50"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-[10px] text-gray-400">{item.name}</span>
                  </div>
                ))}
              </div>

              <PhotoUpload />

              <p className="mt-8 text-[10px] text-gray-700 text-center leading-relaxed">
                본 서비스는 엔터테인먼트 목적으로 제작되었으며,
                <br />
                AI의 분석 결과는 과학적 근거가 전혀 없습니다.
                <br />
                &ldquo;쓸모없는 AI 만들기&rdquo; 해커톤 출품작
              </p>
              <p className="mt-4 text-[9px] text-gray-800 font-mono">
                v1.6.0 | Gemini 2.5 Flash + Imagen 4 + MediaPipe Face Landmarker
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

        {/* Act 3: 직업 판정 */}
        {currentAct === 3 && (
          <motion.div
            key="act3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="py-8 md:py-12"
          >
            <CareerVerdict onComplete={goToAct4} />
          </motion.div>
        )}

        {/* Act 4: 타임라인 */}
        {currentAct === 4 && (
          <motion.div
            key="act4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="py-8 md:py-12"
          >
            <CareerTimeline onComplete={goToAct5} />
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
