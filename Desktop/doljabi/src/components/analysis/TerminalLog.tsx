"use client";

import { useState, useEffect, useRef } from "react";
import { initialLogLines, generateMeasurementLogs } from "@/data/fake-log-lines";
import type { FaceMeasurements } from "./FaceLandmarks";

interface TerminalLogProps {
  isActive: boolean;
  measurements: FaceMeasurements | null;
  onComplete?: () => void;
}

export default function TerminalLog({ isActive, measurements, onComplete }: TerminalLogProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const logLinesRef = useRef<string[]>(initialLogLines);
  const lineIndexRef = useRef(0);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waitingForMeasurements = useRef(false);

  // Update log lines when measurements arrive
  useEffect(() => {
    if (measurements && waitingForMeasurements.current) {
      const measurementLogs = generateMeasurementLogs(measurements);
      logLinesRef.current = [...logLinesRef.current, ...measurementLogs];
      waitingForMeasurements.current = false;
      // Resume typing
      startTyping();
    } else if (measurements && lineIndexRef.current < initialLogLines.length) {
      // Measurements arrived before we finished initial lines — queue them
      const measurementLogs = generateMeasurementLogs(measurements);
      logLinesRef.current = [...initialLogLines, ...measurementLogs];
    }
  }, [measurements]);

  const startTyping = () => {
    let charIndex = 0;

    const typeChar = () => {
      if (lineIndexRef.current >= logLinesRef.current.length) {
        onComplete?.();
        return;
      }

      const currentLine = logLinesRef.current[lineIndexRef.current];

      if (charIndex <= currentLine.length) {
        setCurrentText(currentLine.substring(0, charIndex));
        charIndex++;
        typingRef.current = setTimeout(typeChar, 20 + Math.random() * 15);
        return;
      }

      // Line complete
      setLines((prev) => [...prev, currentLine]);
      setCurrentText("");
      charIndex = 0;
      lineIndexRef.current++;

      // Check if we've exhausted initial lines and need measurements
      if (
        lineIndexRef.current >= initialLogLines.length &&
        logLinesRef.current.length === initialLogLines.length &&
        !measurements
      ) {
        waitingForMeasurements.current = true;
        return; // Pause until measurements arrive
      }

      const delay = lineIndexRef.current >= logLinesRef.current.length ? 0 : 200 + Math.random() * 300;
      typingRef.current = setTimeout(typeChar, delay);
    };

    typingRef.current = setTimeout(typeChar, 100);
  };

  useEffect(() => {
    if (!isActive) return;

    // Start typing after a short delay
    typingRef.current = setTimeout(() => startTyping(), 500);

    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [isActive]);

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
        ── Gemini Doljabi AI + MediaPipe Face Landmarker ──
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

      {/* Blinking cursor when waiting */}
      {!currentText && lines.length > 0 && waitingForMeasurements.current && (
        <div className="text-yellow-400 leading-relaxed animate-pulse">
          [ WAIT ] MediaPipe 분석 결과 대기 중...▌
        </div>
      )}

      {/* Initial cursor */}
      {!currentText && lines.length === 0 && isActive && (
        <div className="text-green-400">
          <span className="animate-pulse">▌</span>
        </div>
      )}
    </div>
  );
}
