"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSessionStore } from "@/store/session";
import NewspaperCard from "./NewspaperCard";

interface CareerTimelineProps {
  onComplete: () => void;
}

export default function CareerTimeline({ onComplete }: CareerTimelineProps) {
  const analysisResult = useSessionStore((s) => s.analysisResult);
  const timelineEvents = useSessionStore((s) => s.timelineEvents);
  const timelineLoading = useSessionStore((s) => s.timelineLoading);
  const setTimelineEvents = useSessionStore((s) => s.setTimelineEvents);
  const setTimelineLoading = useSessionStore((s) => s.setTimelineLoading);

  // Fetch timeline on mount
  useEffect(() => {
    if (!analysisResult || timelineEvents.length > 0) return;

    setTimelineLoading(true);

    fetch("/api/generate-timeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        occupationName: analysisResult.topOccupation.occupation.nameKo,
        occupationId: analysisResult.topOccupation.occupation.id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.events?.length) {
          setTimelineEvents(data.events);
        }
      })
      .catch(console.error)
      .finally(() => setTimelineLoading(false));
  }, [analysisResult, timelineEvents.length, setTimelineEvents, setTimelineLoading]);

  if (!analysisResult) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-amber-400 mb-2">
          생애 예언서
        </h2>
        <p className="text-gray-500 text-sm">
          {analysisResult.topOccupation.occupation.emoji}{" "}
          {analysisResult.topOccupation.occupation.nameKo}로서의 30년
        </p>
      </div>

      {/* Loading */}
      {timelineLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500 text-sm">미래를 예언하는 중...</p>
        </div>
      )}

      {/* Timeline */}
      {timelineEvents.length > 0 && (
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-700 -translate-x-1/2 hidden md:block" />
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-700 md:hidden" />

          {/* Events */}
          <div className="space-y-8">
            {timelineEvents.map((event, i) => (
              <div key={i} className="relative">
                {/* Year marker */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 -top-3 z-10">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-[8px] font-bold text-black">
                      {String(event.year).slice(2)}
                    </span>
                  </div>
                </div>

                {/* Card */}
                <div className="pl-10 md:pl-0">
                  <NewspaperCard
                    event={event}
                    index={i}
                    isLeft={i % 2 === 0}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* End marker */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12 py-6 border-t border-gray-800"
          >
            <p className="text-gray-600 text-xs font-mono">
              ─── END OF PREDICTION ───
            </p>
            <p className="text-gray-700 text-[10px] mt-1">
              본 예언은 AI가 만든 허구이며, 어떠한 과학적 근거도 없습니다.
            </p>
          </motion.div>
        </div>
      )}

      {/* Continue to share */}
      <div className="text-center mt-8">
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition active:scale-95"
        >
          결과 공유하기
        </button>
      </div>
    </div>
  );
}
