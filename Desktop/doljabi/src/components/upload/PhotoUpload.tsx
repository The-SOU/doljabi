"use client";

import { useRef, useState, useCallback } from "react";
import { useSessionStore, type Gender } from "@/store/session";

const SAMPLE_BABIES = [
  { src: "/images/samples/sample1.png", label: "아기 1" },
  { src: "/images/samples/sample2.png", label: "아기 2" },
  { src: "/images/samples/sample3.png", label: "아기 3" },
];

export default function PhotoUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const setBabyImage = useSessionStore((s) => s.setBabyImage);
  const setCurrentAct = useSessionStore((s) => s.setCurrentAct);
  const gender = useSessionStore((s) => s.gender);
  const setGender = useSessionStore((s) => s.setGender);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        setBabyImage(result, file);
      };
      reader.readAsDataURL(file);
    },
    [setBabyImage]
  );

  const handleSampleSelect = useCallback(
    async (src: string) => {
      try {
        const res = await fetch(src);
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPreview(result);
          setBabyImage(result, new File([blob], "sample.png", { type: "image/png" }));
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("Sample image load failed:", err);
      }
    },
    [setBabyImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleStart = () => {
    if (preview) {
      setCurrentAct(1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Gender Selection */}
      <div className="w-full">
        <p className="text-gray-400 text-sm text-center mb-3">아기의 성별을 선택해주세요</p>
        <div className="flex justify-center gap-3">
          {([
            { value: "male" as Gender, label: "남아", emoji: "👦" },
            { value: "female" as Gender, label: "여아", emoji: "👧" },
          ]).map((option) => (
            <button
              key={option.value}
              onClick={() => setGender(option.value)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                gender === option.value
                  ? "bg-amber-500/20 border-2 border-amber-500 text-amber-400"
                  : "bg-gray-800/50 border-2 border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              <span className="text-xl">{option.emoji}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={`relative w-full aspect-square rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
          isDragging
            ? "border-amber-400 bg-amber-400/10 scale-105"
            : preview
            ? "border-amber-500 bg-black"
            : "border-gray-600 bg-gray-900/50 hover:border-amber-500/50 hover:bg-gray-900/80"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !preview && fileInputRef.current?.click()}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="아기 사진"
              className="w-full h-full object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
              }}
              className="absolute top-3 right-3 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-black/80 transition"
            >
              ✕
            </button>
          </>
        ) : (
          <div className="text-center p-8">
            <div className="text-6xl mb-4">👶</div>
            <p className="text-gray-300 text-lg font-medium mb-2">
              아기 사진을 올려주세요
            </p>
            <p className="text-gray-500 text-sm">
              클릭하거나 사진을 드래그하세요
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
      />

      {/* Sample babies */}
      {!preview && (
        <div className="w-full">
          <p className="text-gray-500 text-xs text-center mb-3">
            또는 예시 아기를 선택해보세요
          </p>
          <div className="flex justify-center gap-4">
            {SAMPLE_BABIES.map((sample) => (
              <button
                key={sample.src}
                onClick={() => handleSampleSelect(sample.src)}
                className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-700 hover:border-amber-500 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <img
                  src={sample.src}
                  alt={sample.label}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Start Button */}
      {preview && (
        <button
          onClick={handleStart}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-lg font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-amber-500/25 active:scale-95"
        >
          🔮 돌잡이 분석 시작하기
        </button>
      )}
    </div>
  );
}
