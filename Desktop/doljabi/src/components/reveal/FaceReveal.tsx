"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/store/session";

interface FaceRevealProps {
  onComplete: () => void;
}

const AGE_STAGES = [
  { age: 1, label: "1세 (현재)" },
  { age: 10, label: "10세" },
  { age: 20, label: "20세" },
  { age: 30, label: "30세" },
];

export default function FaceReveal({ onComplete }: FaceRevealProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const babyImage = useSessionStore((s) => s.babyImage);
  const generatedFaces = useSessionStore((s) => s.generatedFaces);
  const analysisResult = useSessionStore((s) => s.analysisResult);
  const setAgedFaceLoading = useSessionStore((s) => s.setAgedFaceLoading);
  const setGeneratedFace = useSessionStore((s) => s.setGeneratedFace);

  // Generate aged faces on mount
  useEffect(() => {
    if (!babyImage || !analysisResult) return;

    setAgedFaceLoading(true);

    const generateFaces = async () => {
      for (const age of [10, 20, 30]) {
        try {
          const res = await fetch("/api/generate-face", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: babyImage,
              targetAge: age,
              occupation: analysisResult.topOccupation.occupation.nameKo,
              faceDescription: analysisResult.faceDescription,
            }),
          });
          const data = await res.json();
          if (data.image) {
            setGeneratedFace(age, `data:image/png;base64,${data.image}`);
          }
        } catch {
          // Fallback: continue without generated image
        }
      }
      setAgedFaceLoading(false);
    };

    generateFaces();
  }, [babyImage, analysisResult, setAgedFaceLoading, setGeneratedFace]);

  // Timelapse animation
  useEffect(() => {
    const timings = [0, 3000, 6000, 9000]; // ms for each stage

    const timeouts = timings.map((delay, i) =>
      setTimeout(() => {
        setCurrentStage(i);
        if (i === AGE_STAGES.length - 1) {
          // Final stage: grayscale then color
          setIsGrayscale(true);
          setTimeout(() => {
            setIsGrayscale(false);
            setShowInfo(true);
            setTimeout(onComplete, 2000);
          }, 1500);
        }
      }, delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [onComplete]);

  const getCurrentImage = () => {
    const stage = AGE_STAGES[currentStage];
    if (stage.age === 1) return babyImage;
    return generatedFaces[stage.age] || babyImage; // fallback to baby
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 px-4">
      <h2 className="text-xl font-bold text-amber-400">시간 여행 중...</h2>

      {/* Age counter */}
      <div className="text-center">
        <motion.div
          key={currentStage}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-black text-white"
        >
          {AGE_STAGES[currentStage].age}세
        </motion.div>
        <p className="text-gray-500 text-sm mt-1">
          {AGE_STAGES[currentStage].label}
        </p>
      </div>

      {/* Face image with morphing */}
      <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden bg-gray-900">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentStage}
            src={getCurrentImage() || ""}
            alt={`${AGE_STAGES[currentStage].age}세 예상`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: isGrayscale ? "grayscale(100%)" : "grayscale(0%)",
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </AnimatePresence>

        {/* Age progress bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
          <motion.div
            className="h-full bg-amber-400"
            animate={{ width: `${((currentStage + 1) / AGE_STAGES.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Fake camera info */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-gray-600 font-mono text-center leading-relaxed bg-black/50 px-4 py-2 rounded"
          >
            촬영: 2055년 3월 14일 14:23 KST / 장소: 서울특별시 강남구
            <br />
            촬영자: Gemini-Nano-Banana-v47 / ISO: 3200 / f/1.8
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
