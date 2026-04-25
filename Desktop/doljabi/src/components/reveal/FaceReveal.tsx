"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/store/session";
import { generateAgedFace } from "@/lib/gemini-client";

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
  const [imagesReady, setImagesReady] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("이미지 생성 준비 중...");
  const babyImage = useSessionStore((s) => s.babyImage);
  const generatedFaces = useSessionStore((s) => s.generatedFaces);
  const analysisResult = useSessionStore((s) => s.analysisResult);
  const setGeneratedFace = useSessionStore((s) => s.setGeneratedFace);

  // Generate aged faces on mount — 병렬 호출
  useEffect(() => {
    if (!babyImage || !analysisResult) return;

    const generateFaces = async () => {
      const ages = [10, 20, 30];
      let completed = 0;

      setGenerationStatus("10세 / 20세 / 30세 얼굴 동시 생성 중...");

      await Promise.all(
        ages.map(async (age) => {
          const result = await generateAgedFace(
            babyImage,
            age,
            analysisResult.topOccupation.occupation.nameKo,
            analysisResult.faceDescription
          );
          completed++;
          setGenerationStatus(`얼굴 생성 중... (${completed}/${ages.length})`);

          if (result) {
            setGeneratedFace(age, result);
          }
        })
      );

      setGenerationStatus("생성 완료! 시간 여행 시작...");
      await new Promise((r) => setTimeout(r, 500));
      setImagesReady(true);
    };

    generateFaces();
  }, [babyImage, analysisResult, setGeneratedFace]);

  // 이미지가 준비된 후에만 timelapse 애니메이션 시작
  useEffect(() => {
    if (!imagesReady) return;

    const timings = [0, 3000, 6000, 9000];

    const timeouts = timings.map((delay, i) =>
      setTimeout(() => {
        setCurrentStage(i);
        if (i === AGE_STAGES.length - 1) {
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
  }, [imagesReady, onComplete]);

  const getCurrentImage = () => {
    const stage = AGE_STAGES[currentStage];
    if (stage.age === 1) return babyImage;
    return generatedFaces[stage.age] || babyImage;
  };

  // 생성된 이미지 수
  const generatedCount = useMemo(
    () => [10, 20, 30].filter((age) => generatedFaces[age]).length,
    [generatedFaces]
  );

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 px-4">
      <h2 className="text-xl font-bold text-amber-400">
        {imagesReady ? "시간 여행 중..." : "30년 후 얼굴 생성 중..."}
      </h2>

      {/* 이미지 생성 대기 화면 */}
      {!imagesReady && (
        <div className="flex flex-col items-center gap-4">
          {/* 아기 사진 미리보기 */}
          <div className="relative w-48 h-48 rounded-xl overflow-hidden">
            <img
              src={babyImage || ""}
              alt="아기 사진"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full" />
            </div>
          </div>

          <p className="text-gray-400 text-sm animate-pulse">{generationStatus}</p>

          {/* 생성 진행률 */}
          <div className="flex gap-3">
            {[10, 20, 30].map((age) => (
              <div
                key={age}
                className={`px-3 py-1.5 rounded-full text-xs font-mono ${
                  generatedFaces[age]
                    ? "bg-green-900/50 text-green-400"
                    : "bg-gray-800 text-gray-600"
                }`}
              >
                {age}세 {generatedFaces[age] ? "✓" : "..."}
              </div>
            ))}
          </div>

          <p className="text-[10px] text-gray-600">
            Gemini 2.5 Flash Image로 {generatedCount}/3 생성됨
          </p>
        </div>
      )}

      {/* 타임랩스 애니메이션 (이미지 준비 후) */}
      {imagesReady && (
        <>
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
        </>
      )}
    </div>
  );
}
