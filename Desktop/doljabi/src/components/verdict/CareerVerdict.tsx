"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/store/session";
import { generateTimeline } from "@/lib/gemini-client";
import OccupationRadarChart from "./OccupationRadarChart";
import TypewriterText from "./TypewriterText";
import ClassifiedStamp from "./ClassifiedStamp";
import NewspaperCard from "../timeline/NewspaperCard";

interface CareerVerdictProps {
  onComplete: () => void;
}

export default function CareerVerdict({ onComplete }: CareerVerdictProps) {
  const [showStamp, setShowStamp] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [showGwansang, setShowGwansang] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const analysisResult = useSessionStore((s) => s.analysisResult);
  const generatedFaces = useSessionStore((s) => s.generatedFaces);
  const babyImage = useSessionStore((s) => s.babyImage);
  const timelineEvents = useSessionStore((s) => s.timelineEvents);
  const setTimelineEvents = useSessionStore((s) => s.setTimelineEvents);
  const setTimelineLoading = useSessionStore((s) => s.setTimelineLoading);

  const adultFace = generatedFaces[40] || babyImage;

  // 타임라인 생성 시작
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

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowStamp(true), 500),
      setTimeout(() => setShowChart(true), 1500),
      setTimeout(() => setShowTypewriter(true), 3000),
      setTimeout(() => setShowGwansang(true), 7000),
      setTimeout(() => setShowTimeline(true), 9000),
      setTimeout(() => setShowButton(true), 10000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!analysisResult) return null;

  const { topOccupation, allMatches, gwansangText } = analysisResult;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="relative bg-gray-900/80 border border-gray-700 rounded-xl p-6 md:p-8 mb-6">
        <AnimatePresence>
          {showStamp && <ClassifiedStamp />}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row gap-6 mt-8">
          {/* Left: ID Photo */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="w-40 h-52 bg-gray-200 rounded-md overflow-hidden border-4 border-white shadow-lg">
              <img
                src={adultFace || ""}
                alt="40년 후 예상 얼굴"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[9px] text-gray-600 text-center mt-2 font-mono">
              피험자 #2025-{Math.floor(Math.random() * 9000 + 1000)}
            </p>
          </div>

          {/* Right: Radar Chart */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-red-400 font-mono">CONFIDENTIAL — 2065 커리어 리포트</span>
            </div>

            <AnimatePresence>
              {showChart && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <OccupationRadarChart matches={allMatches} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Career reveal */}
      <AnimatePresence>
        {showTypewriter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 md:p-8 mb-6 text-center"
          >
            <p className="text-gray-500 text-sm mb-3">AI 예측 결과</p>
            <TypewriterText
              prefix="예 상 직 업 : "
              text={`${topOccupation.occupation.emoji} ${topOccupation.occupation.nameKo}`}
              className="text-3xl md:text-4xl font-black text-amber-400"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              className="text-gray-400 text-lg mt-3"
            >
              일치율 {topOccupation.percentage}%
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI 견해 (축약) */}
      <AnimatePresence>
        {showGwansang && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-600 text-xs font-medium">AI 분석 견해</span>
            </div>
            <p className="text-amber-200/80 text-sm leading-relaxed">
              {gwansangText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline (3막에 합침) */}
      <AnimatePresence>
        {showTimeline && timelineEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-amber-400 mb-1">
                생애 예언서
              </h3>
              <p className="text-gray-500 text-xs">
                {topOccupation.occupation.emoji} {topOccupation.occupation.nameKo}로서의 40년
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-700" />

              <div className="space-y-6">
                {timelineEvents.map((event, i) => (
                  <div key={i} className="relative">
                    <div className="absolute left-4 -translate-x-1/2 -top-1 z-10">
                      <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-[7px] font-bold text-black">
                          {String(event.year).slice(2)}
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
                <p className="text-gray-600 text-xs font-mono">
                  ─── END OF PREDICTION ───
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share button */}
      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-6"
          >
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition active:scale-95"
            >
              결과 공유하기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
