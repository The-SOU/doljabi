"use client";

import { useState, useEffect, useRef } from "react";
import { fakeLogLines } from "@/data/fake-log-lines";

interface TerminalLogProps {
  isActive: boolean;
  onComplete?: () => void;
}

export default function TerminalLog({ isActive, onComplete }: TerminalLogProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const lineIndexRef = useRef(0);

  useEffect(() => {
    if (!isActive) return;

    let charIndex = 0;
    let currentLine = fakeLogLines[0];
    lineIndexRef.current = 0;

    const typeChar = () => {
      if (lineIndexRef.current >= fakeLogLines.length) {
        onComplete?.();
        return;
      }

      currentLine = fakeLogLines[lineIndexRef.current];

      if (charIndex <= currentLine.length) {
        setCurrentText(currentLine.substring(0, charIndex));
        charIndex++;
        return window.setTimeout(typeChar, 25 + Math.random() * 15);
      }

      // Line complete
      setLines((prev) => [...prev, currentLine]);
      setCurrentText("");
      charIndex = 0;
      lineIndexRef.current++;

      // Pause between lines
      const delay = lineIndexRef.current === fakeLogLines.length
        ? 0
        : 300 + Math.random() * 400;
      return window.setTimeout(typeChar, delay);
    };

    const timeout = window.setTimeout(typeChar, 500);
    return () => clearTimeout(timeout);
  }, [isActive, onComplete]);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines, currentText]);

  return (
    <div
      ref={containerRef}
      className="w-full h-48 md:h-56 bg-black/90 rounded-lg border border-green-900/50 p-3 md:p-4 overflow-y-auto font-mono text-xs md:text-sm"
    >
      {/* Header */}
      <div className="text-green-600 mb-2 text-[10px]">
        ── Gemini 관상학 엔진 v2.7.3 ──────────────────
      </div>

      {/* Completed lines */}
      {lines.map((line, i) => (
        <div key={i} className="text-green-400 leading-relaxed">
          {line}
        </div>
      ))}

      {/* Currently typing line */}
      {currentText && (
        <div className="text-green-400 leading-relaxed">
          {currentText}
          <span className="animate-pulse">▌</span>
        </div>
      )}

      {/* Blinking cursor when idle */}
      {!currentText && lines.length === 0 && isActive && (
        <div className="text-green-400">
          <span className="animate-pulse">▌</span>
        </div>
      )}
    </div>
  );
}
