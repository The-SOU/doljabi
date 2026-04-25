"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/store/session";
import OccupationRadarChart from "./OccupationRadarChart";
import TypewriterText from "./TypewriterText";
import GwansangBox from "./GwansangBox";
import ClassifiedStamp from "./ClassifiedStamp";

interface CareerVerdictProps {
  onComplete: () => void;
}

export default function CareerVerdict({ onComplete }: CareerVerdictProps) {
  const [showStamp, setShowStamp] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [showGwansang, setShowGwansang] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const analysisResult = useSessionStore((s) => s.analysisResult);
  const generatedFaces = useSessionStore((s) => s.generatedFaces);
  const babyImage = useSessionStore((s) => s.babyImage);

  const adultFace = generatedFaces[30] || babyImage;

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowStamp(true), 500),
      setTimeout(() => setShowChart(true), 1500),
      setTimeout(() => setShowTypewriter(true), 3000),
      setTimeout(() => setShowGwansang(true), 7000),
      setTimeout(() => setShowButton(true), 9000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!analysisResult) return null;

  const { topOccupation, allMatches, gwansangText } = analysisResult;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Classified header */}
      <div className="relative bg-gray-900/80 border border-gray-700 rounded-xl p-6 md:p-8 mb-6">
        {/* Stamp */}
        <AnimatePresence>
          {showStamp && <ClassifiedStamp />}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row gap-6 mt-8">
          {/* Left: ID Photo */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="w-40 h-52 bg-gray-200 rounded-md overflow-hidden border-4 border-white shadow-lg">
              <img
                src={adultFace || ""}
                alt="30년 후 예상 얼굴"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[9px] text-gray-600 text-center mt-2 font-mono">
              피험자 #2025-{Math.floor(Math.random() * 9000 + 1000)}
            </p>
          </div>

          {/* Right: Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-red-400 font-mono">CLASSIFIED — 2055 커리어 리포트</span>
            </div>

            {/* Radar Chart */}
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
            <p className="text-gray-500 text-sm mb-3">분석 결과</p>
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

      {/* Gwansang box */}
      <AnimatePresence>
        {showGwansang && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GwansangBox text={gwansangText} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue button */}
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
              30년 커리어 타임라인 보기 →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
