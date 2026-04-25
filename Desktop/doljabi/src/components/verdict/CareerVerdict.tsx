"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/store/session";
import { generateTimeline } from "@/lib/gemini-client";
import { toPng } from "html-to-image";
import InferenceVisualization from "./InferenceVisualization";
import TypewriterText from "./TypewriterText";
import NewspaperCard from "../timeline/NewspaperCard";
import type { MatchResult } from "@/lib/matching-client";

interface CareerVerdictProps {
  onComplete: () => void;
}

type VerdictPhase = "inference" | "result" | "timeline";

export default function CareerVerdict({ onComplete }: CareerVerdictProps) {
  const [phase, setPhase] = useState<VerdictPhase>("inference");
  const [showResult, setShowResult] = useState(false);
  const [showGwansang, setShowGwansang] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const analysisResult = useSessionStore((s) => s.analysisResult);
  const generatedFaces = useSessionStore((s) => s.generatedFaces);
  const babyImage = useSessionStore((s) => s.babyImage);
  const timelineEvents = useSessionStore((s) => s.timelineEvents);
  const setTimelineEvents = useSessionStore((s) => s.setTimelineEvents);
  const setTimelineLoading = useSessionStore((s) => s.setTimelineLoading);

  const adultFace = generatedFaces[40] || babyImage;

  // 타임라인 생성 (마운트 시 바로 시작)
  useEffect(() => {
    if (!analysisResult || timelineEvents.length > 0) return;

    setTimelineLoading(true);
    generateTimeline(analysisResult.topOccupation.occupation.nameKo)
      .then((events) => {
        if (events?.length) setTimelineEvents(events);
      })
      .catch(console.error)
      .finally(() => setTimelineLoading(false));
  }, [analysisResult, timelineEvents.length, setTimelineEvents, setTimelineLoading]);

  // 추론 수렴 후 → 결과 표시
  const handleConverged = useCallback((_winner: MatchResult) => {
    setTimeout(() => {
      setPhase("result");
      // Sequenced reveals
      setTimeout(() => setShowResult(true), 500);
      setTimeout(() => setShowGwansang(true), 4000);
      setTimeout(() => {
        setPhase("timeline");
        setShowTimeline(true);
      }, 6000);
      setTimeout(() => setShowButton(true), 7000);
    }, 1000);
  }, []);

  // 이미지 저장
  const handleSaveImage = useCallback(async () => {
    if (!resultRef.current) return;
    try {
      const dataUrl = await toPng(resultRef.current, {
        backgroundColor: "#0a0e1a",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `doljabi-result-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Image save failed:", err);
    }
  }, []);

  if (!analysisResult) return null;

  const { topOccupation, allMatches, gwansangText } = analysisResult;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Phase 1: ML 추론 시각화 */}
      <AnimatePresence>
        {phase === "inference" && (
          <motion.div
            key="inference"
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-cyan-400">Inference in Progress</h2>
              <p className="text-[10px] text-gray-600">직업 적합도 추론 엔진 실행 중</p>
            </div>
            <InferenceVisualization
              matches={allMatches}
              onConverged={handleConverged}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: 결과 (캡처 대상) */}
      {(phase === "result" || phase === "timeline") && (
        <div ref={resultRef}>
          {/* 최종 결과 카드 */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-[#0a0e1a] border border-gray-700/50 rounded-xl p-6 md:p-8 mb-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-green-400 font-mono">PREDICTION COMPLETE</span>
                  </div>
                  <span className="text-[10px] text-gray-600 font-mono">
                    confidence: {topOccupation.percentage}%
                  </span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* 40세 얼굴 */}
                  <div className="flex-shrink-0">
                    <div className="w-36 h-44 rounded-lg overflow-hidden border-2 border-amber-500/30 shadow-lg shadow-amber-500/10">
                      <img
                        src={adultFace || ""}
                        alt="40년 후 예상"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* 직업 결과 */}
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-gray-500 text-xs mb-2 font-mono">predicted_occupation:</p>
                    <TypewriterText
                      prefix=""
                      text={`${topOccupation.occupation.emoji} ${topOccupation.occupation.nameKo}`}
                      className="text-3xl md:text-4xl font-black text-amber-400"
                      speed={150}
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.5 }}
                      className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start"
                    >
                      <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-[10px] text-amber-400 font-mono">
                        match: {topOccupation.percentage}%
                      </span>
                      <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px] text-cyan-400 font-mono">
                        embedding_sim: {topOccupation.similarity.toFixed(4)}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI 견해 (축약) */}
          <AnimatePresence>
            {showGwansang && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[#0a0e1a] border border-gray-700/50 rounded-xl p-5 mb-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500 font-mono">inference_rationale:</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {gwansangText}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timeline */}
          <AnimatePresence>
            {showTimeline && timelineEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-amber-400 mb-1 font-mono">
                    PREDICTED_TIMELINE
                  </h3>
                  <p className="text-gray-600 text-[10px] font-mono">
                    {topOccupation.occupation.emoji} {topOccupation.occupation.nameKo} — 40년 생애 시뮬레이션
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-800" />

                  <div className="space-y-6">
                    {timelineEvents.map((event, i) => (
                      <div key={i} className="relative">
                        <div className="absolute left-4 -translate-x-1/2 -top-1 z-10">
                          <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-bold text-black">
                              {event.age}세
                            </span>
                          </div>
                        </div>
                        <div className="pl-10">
                          <NewspaperCard event={event} index={i} isLeft={false} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-8 py-4 border-t border-gray-800">
                    <p className="text-gray-700 text-[10px] font-mono">
                      ─── END OF SIMULATION ───
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Buttons */}
      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-3 mt-6"
          >
            <button
              onClick={handleSaveImage}
              className="w-full py-3 bg-gray-800 text-gray-300 font-medium rounded-xl hover:bg-gray-700 transition active:scale-95 font-mono text-sm"
            >
              결과 이미지 저장
            </button>
            <button
              onClick={onComplete}
              className="w-full py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition active:scale-95"
            >
              공유하기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
