"use client";

import { useRef, useState, useCallback } from "react";
import { useSessionStore } from "@/store/session";

export default function PhotoUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const setBabyImage = useSessionStore((s) => s.setBabyImage);
  const setCurrentAct = useSessionStore((s) => s.setCurrentAct);

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

      {/* Start Button */}
      {preview && (
        <button
          onClick={handleStart}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-lg font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-amber-500/25 active:scale-95"
        >
          🔮 관상 분석 시작하기
        </button>
      )}
    </div>
  );
}
