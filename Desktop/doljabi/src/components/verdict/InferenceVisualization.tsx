"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MatchResult } from "@/lib/matching-client";

interface InferenceVisualizationProps {
  matches: MatchResult[];
  onConverged: (winner: MatchResult) => void;
}

// 탈락 사유 (관상학 + ML 혼합)
const ELIMINATION_REASONS: Record<string, string> = {
  "의사": "印堂 width 2.1cm < threshold 2.5cm / cosine_sim 0.41",
  "변호사": "관골 symmetry 0.72 < min 0.85 / feature_dist 1.247",
  "과학자": "전두엽 발달지수 0.38 / attention_score below cutoff",
  "CEO": "하정 authority_index 0.44 / embedding_norm 0.612",
  "100만 유튜버": "복덕방 charisma_vector 0.91 / top-k candidate",
  "아이돌": "오악 symmetry 0.94 / high visual_embedding alignment",
  "축구선수": "하정 muscular_index 0.21 < 0.45 / body_ratio mismatch",
  "셰프": "준두 食福지수 0.67 / olfactory_affinity 0.58",
  "대통령": "천정 authority_field 0.29 / charisma_embedding dim<512",
  "판사": "미간 직선도 0.88 / justice_vector cosine 0.37",
};

// 페이크 추론 로그
function generateInferenceLogs(matches: MatchResult[], phase: number): string {
  const timestamp = new Date();
  const ts = `${timestamp.getHours().toString().padStart(2, "0")}:${timestamp.getMinutes().toString().padStart(2, "0")}:${timestamp.getSeconds().toString().padStart(2, "0")}.${Math.floor(Math.random() * 999).toString().padStart(3, "0")}`;

  const logs: string[][] = [
    // Phase 0: 초기화
    [
      `[${ts}] loading face_embedding model (dim=1408)...`,
      `[${ts}] computing cosine similarity matrix (10×1408)...`,
      `[${ts}] initializing softmax temperature: τ=1.0`,
    ],
    // Phase 1: 탐색
    [
      `[${ts}] iter ${Math.floor(Math.random() * 200 + 100)}: re-ranking candidates by Δcos`,
      `[${ts}] feature alignment: 인당-centroid Δ=${(Math.random() * 0.5 + 0.1).toFixed(2)}σ`,
      `[${ts}] gradient update: ∂L/∂w = ${(Math.random() * 0.05).toFixed(4)}, lr=3e-4`,
    ],
    // Phase 2: 수렴
    [
      `[${ts}] softmax τ annealing: ${(0.9 - phase * 0.1).toFixed(2)} → ${(0.8 - phase * 0.1).toFixed(2)}`,
      `[${ts}] bottom-3 confidence < 0.35, flagged for elimination`,
      `[${ts}] cross-attention with career trajectory data...`,
    ],
    // Phase 3: 제거
    [
      `[${ts}] candidate eliminated → below confidence threshold`,
      `[${ts}] re-normalizing probability distribution...`,
      `[${ts}] 측면비대칭 penalty applied: -0.${Math.floor(Math.random() * 9 + 1)}`,
    ],
    // Phase 4: 확정
    [
      `[${ts}] top-1 stabilized for 500+ iterations`,
      `[${ts}] final confidence: ${matches[0]?.percentage || 85}%`,
      `[${ts}] ■ CONVERGED — prediction locked`,
    ],
  ];

  const phaseIdx = Math.min(phase, logs.length - 1);
  const lineIdx = Math.floor(Math.random() * logs[phaseIdx].length);
  return logs[phaseIdx][lineIdx];
}

export default function InferenceVisualization({ matches, onConverged }: InferenceVisualizationProps) {
  const [candidates, setCandidates] = useState<
    { match: MatchResult; currentScore: number; direction: "up" | "down" | "stable"; eliminated: boolean; reason?: string }[]
  >([]);
  const [phase, setPhase] = useState(0); // 0=init, 1=explore, 2=converge, 3=eliminate, 4=confirmed
  const [iter, setIter] = useState(0);
  const [loss, setLoss] = useState(3.2);
  const [confidence, setConfidence] = useState(12);
  const [temperature, setTemperature] = useState(1.0);
  const [logs, setLogs] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize candidates
  useEffect(() => {
    if (matches.length === 0) return;
    setCandidates(
      matches.map((m) => ({
        match: m,
        currentScore: 0.3 + Math.random() * 0.4, // Start random
        direction: "stable" as const,
        eliminated: false,
      }))
    );
  }, [matches]);

  // Main animation loop (50ms tick)
  useEffect(() => {
    if (candidates.length === 0) return;

    const startTime = Date.now();
    const TOTAL_DURATION = 9000; // 9 seconds

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = elapsed / TOTAL_DURATION;
      setElapsed(Math.floor(elapsed / 1000));

      // Update phase
      let currentPhase = 0;
      if (progress < 0.22) currentPhase = 1;      // 0~2s: explore
      else if (progress < 0.55) currentPhase = 2;  // 2~5s: converge
      else if (progress < 0.78) currentPhase = 3;  // 5~7s: eliminate
      else if (progress < 0.94) currentPhase = 4;  // 7~8.5s: confirmed
      else currentPhase = 5;                        // done
      setPhase(currentPhase);

      // Update metadata
      setIter(Math.min(1000, Math.floor(progress * 1200)));
      const baseLoss = 3.2 - progress * 2.8;
      setLoss(Math.max(0.15, baseLoss + (Math.random() - 0.5) * 0.3 * (1 - progress)));
      setConfidence(Math.min(99.7, 12 + progress * 88 + (Math.random() - 0.5) * 5));
      setTemperature(Math.max(0.01, 1.0 - progress * 0.99));

      // Update candidate scores
      setCandidates((prev) => {
        const sorted = [...prev].sort((a, b) => b.match.percentage - a.match.percentage);

        return sorted.map((c, idx) => {
          if (c.eliminated) return c;

          const targetScore = c.match.percentage / 100;
          let noise = 0;
          let eliminated = false;
          let reason: string | undefined;

          if (currentPhase <= 1) {
            // Explore: big noise
            noise = (Math.random() - 0.5) * 0.3;
          } else if (currentPhase === 2) {
            // Converge: less noise, start separating
            noise = (Math.random() - 0.5) * 0.15;
          } else if (currentPhase === 3) {
            // Eliminate: bottom candidates fade out
            noise = (Math.random() - 0.5) * 0.05;
            if (idx >= 7 && !c.eliminated) {
              eliminated = true;
              reason = ELIMINATION_REASONS[c.match.occupation.nameKo] || "confidence below threshold";
            }
          } else if (currentPhase >= 4) {
            // Final: almost no noise
            noise = (Math.random() - 0.5) * 0.01;
            if (idx >= 3 && !c.eliminated) {
              eliminated = true;
              reason = ELIMINATION_REASONS[c.match.occupation.nameKo] || "below top-3 cutoff";
            }
          }

          const newScore = Math.max(0.05, Math.min(0.99, targetScore + noise * (1 - progress)));
          const direction = newScore > c.currentScore + 0.01 ? "up" : newScore < c.currentScore - 0.01 ? "down" : "stable";

          return { ...c, currentScore: newScore, direction, eliminated, reason: reason || c.reason };
        });
      });

      // Add log
      if (Math.random() < 0.15) {
        setLogs((prev) => [...prev.slice(-20), generateInferenceLogs(matches, currentPhase)]);
      }

      // Done
      if (progress >= 1) {
        clearInterval(intervalRef.current!);
        onConverged(matches[0]);
      }
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [candidates.length, matches, onConverged]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const sortedCandidates = [...candidates].sort((a, b) => b.currentScore - a.currentScore);
  const isConverged = phase >= 5;

  return (
    <div className="w-full max-w-2xl mx-auto font-mono text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
      {/* Top: Metadata Panel */}
      <div className="bg-[#0a0e1a] border border-gray-700/50 rounded-t-xl p-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConverged ? "bg-green-500" : "bg-amber-500 animate-pulse"}`} />
          <span className="text-gray-400">{isConverged ? "CONVERGED" : "INFERENCE ACTIVE"}</span>
        </div>
        <div className="text-gray-500">
          model: <span className="text-gray-300">gemini-2.5-flash</span>
        </div>
        <div className="text-gray-500">
          iter: <span className="text-cyan-400">{iter.toString().padStart(4, "0")}</span> / 1000
        </div>
        <div className="text-gray-500">
          loss: <span className={loss < 0.5 ? "text-green-400" : "text-amber-400"}>{loss.toFixed(3)}</span>
        </div>
        <div className="text-gray-500">
          confidence: <span className={confidence > 80 ? "text-green-400" : "text-amber-400"}>{confidence.toFixed(1)}%</span>
        </div>
        <div className="text-gray-500">
          τ: <span className="text-purple-400">{temperature.toFixed(3)}</span>
        </div>

        {/* REC indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-[10px]">REC 00:00:{elapsed.toString().padStart(2, "0")}</span>
        </div>
      </div>

      {/* Middle: Probability Bars */}
      <div className="bg-[#0a0e1a] border-x border-gray-700/50 p-4 space-y-1.5">
        {sortedCandidates.map((c, idx) => {
          const isWinner = isConverged && idx === 0;
          const barWidth = c.currentScore * 100;

          return (
            <motion.div
              key={c.match.occupation.id}
              layout
              transition={{ duration: 0.3 }}
              className={`flex items-center gap-2 py-1 ${c.eliminated ? "opacity-30" : ""}`}
            >
              {/* Rank */}
              <span className={`w-5 text-right text-[10px] ${isWinner ? "text-amber-400" : "text-gray-600"}`}>
                {c.eliminated ? "—" : `#${idx + 1}`}
              </span>

              {/* Bar */}
              <div className="flex-1 h-5 bg-gray-800/50 rounded-sm overflow-hidden relative">
                <motion.div
                  className={`h-full rounded-sm ${
                    isWinner
                      ? "bg-gradient-to-r from-amber-500 to-amber-400"
                      : c.eliminated
                      ? "bg-gray-700"
                      : idx < 3
                      ? "bg-gradient-to-r from-cyan-600/80 to-cyan-500/60"
                      : "bg-gray-600/60"
                  }`}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
                {isWinner && (
                  <div className="absolute inset-0 bg-amber-400/10 animate-pulse" />
                )}
              </div>

              {/* Label */}
              <span className={`w-20 text-[11px] truncate ${
                isWinner ? "text-amber-400 font-bold" : c.eliminated ? "text-gray-600 line-through" : "text-gray-300"
              }`}>
                {c.match.occupation.emoji} {c.match.occupation.nameKo}
              </span>

              {/* Score */}
              <span className={`w-10 text-right text-[10px] ${isWinner ? "text-amber-400" : "text-gray-500"}`}>
                {c.currentScore.toFixed(2)}
              </span>

              {/* Direction arrow */}
              <span className={`w-3 text-[10px] ${
                c.direction === "up" ? "text-green-400" : c.direction === "down" ? "text-red-400" : "text-gray-600"
              }`}>
                {c.eliminated ? "" : c.direction === "up" ? "↑" : c.direction === "down" ? "↓" : "→"}
              </span>
            </motion.div>
          );
        })}

        {/* Elimination reason popup */}
        <AnimatePresence>
          {sortedCandidates
            .filter((c) => c.eliminated && c.reason)
            .slice(-1)
            .map((c) => (
              <motion.div
                key={`reason-${c.match.occupation.id}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-red-400/70 pl-8 py-0.5"
              >
                ✕ {c.match.occupation.nameKo}: {c.reason}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Bottom: Log Stream */}
      <div
        ref={logContainerRef}
        className="bg-[#0a0e1a] border border-gray-700/50 rounded-b-xl p-3 h-28 overflow-y-auto"
      >
        {logs.map((log, i) => (
          <div key={i} className="text-[10px] leading-relaxed text-slate-400">
            {log}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-[10px] text-slate-600 animate-pulse">initializing inference pipeline...</div>
        )}
      </div>

      {/* System info */}
      <div className="flex justify-between mt-2 text-[9px] text-gray-700 px-1">
        <span>GPU: A100 / VRAM: 38.4 GB / 31.7°C</span>
        <span>embedding dim: 1408 / candidates: {sortedCandidates.filter((c) => !c.eliminated).length}/10</span>
      </div>
    </div>
  );
}
