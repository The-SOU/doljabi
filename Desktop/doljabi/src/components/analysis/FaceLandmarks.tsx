"use client";

import { useEffect, useRef } from "react";

interface FaceLandmarksProps {
  imageUrl: string;
  isActive: boolean;
}

// Approximate face landmark positions (normalized 0-1)
const LANDMARKS = [
  // Face outline (jawline)
  [0.15, 0.42], [0.13, 0.50], [0.14, 0.58], [0.16, 0.66], [0.20, 0.73],
  [0.26, 0.79], [0.33, 0.83], [0.40, 0.86], [0.50, 0.87], [0.60, 0.86],
  [0.67, 0.83], [0.74, 0.79], [0.80, 0.73], [0.84, 0.66], [0.86, 0.58],
  [0.87, 0.50], [0.85, 0.42],
  // Left eyebrow
  [0.23, 0.34], [0.27, 0.31], [0.32, 0.30], [0.37, 0.31], [0.41, 0.33],
  // Right eyebrow
  [0.59, 0.33], [0.63, 0.31], [0.68, 0.30], [0.73, 0.31], [0.77, 0.34],
  // Left eye
  [0.27, 0.39], [0.30, 0.37], [0.34, 0.37], [0.37, 0.39], [0.34, 0.41], [0.30, 0.41],
  // Right eye
  [0.63, 0.39], [0.66, 0.37], [0.70, 0.37], [0.73, 0.39], [0.70, 0.41], [0.66, 0.41],
  // Nose
  [0.50, 0.40], [0.50, 0.47], [0.50, 0.54], [0.44, 0.58], [0.47, 0.59],
  [0.50, 0.60], [0.53, 0.59], [0.56, 0.58],
  // Mouth
  [0.37, 0.68], [0.42, 0.65], [0.47, 0.64], [0.50, 0.65], [0.53, 0.64],
  [0.58, 0.65], [0.63, 0.68], [0.58, 0.72], [0.53, 0.74], [0.50, 0.74],
  [0.47, 0.74], [0.42, 0.72],
  // Extra points for dramatic effect
  [0.50, 0.28], [0.35, 0.28], [0.65, 0.28], [0.20, 0.38], [0.80, 0.38],
  [0.50, 0.80], [0.38, 0.50], [0.62, 0.50],
];

// Connections between landmarks (indices)
const CONNECTIONS = [
  // Jawline
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 16],
  // Eyebrows
  [17, 18], [18, 19], [19, 20], [20, 21],
  [22, 23], [23, 24], [24, 25], [25, 26],
  // Eyes
  [27, 28], [28, 29], [29, 30], [30, 31], [31, 32], [32, 27],
  [33, 34], [34, 35], [35, 36], [36, 37], [37, 38], [38, 33],
  // Nose
  [39, 40], [40, 41], [41, 42], [42, 43], [43, 44], [44, 45], [45, 46],
  // Mouth outer
  [47, 48], [48, 49], [49, 50], [50, 51], [51, 52], [52, 53],
  [53, 54], [54, 55], [55, 56], [56, 57], [57, 58], [58, 47],
];

export default function FaceLandmarks({ imageUrl, isActive }: FaceLandmarksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;

    let pointCount = 0;
    const totalPoints = LANDMARKS.length;
    const startTime = Date.now();

    const draw = () => {
      const elapsed = Date.now() - startTime;
      // Reveal ~5 points per second
      pointCount = Math.min(totalPoints, Math.floor(elapsed / 200));

      ctx.clearRect(0, 0, w, h);

      // Draw connections (faded green lines)
      ctx.strokeStyle = "rgba(34, 197, 94, 0.2)";
      ctx.lineWidth = 1;
      for (const [a, b] of CONNECTIONS) {
        if (a < pointCount && b < pointCount) {
          ctx.beginPath();
          ctx.moveTo(LANDMARKS[a][0] * w, LANDMARKS[a][1] * h);
          ctx.lineTo(LANDMARKS[b][0] * w, LANDMARKS[b][1] * h);
          ctx.stroke();
        }
      }

      // Draw points
      for (let i = 0; i < pointCount; i++) {
        const [x, y] = LANDMARKS[i];
        const px = x * w;
        const py = y * h;

        // Pulse effect for recently added points
        const age = elapsed - i * 200;
        const pulse = age < 500 ? 1 + Math.sin(age / 50) * 0.5 : 1;
        const radius = 2.5 * pulse;

        // Glow
        ctx.beginPath();
        ctx.arc(px, py, radius + 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(34, 197, 94, 0.15)";
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = age < 500 ? "#4ade80" : "#22c55e";
        ctx.fill();
      }

      // Scanning line effect
      const scanY = ((elapsed / 30) % h);
      ctx.strokeStyle = "rgba(34, 197, 94, 0.1)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();

      if (pointCount < totalPoints || isActive) {
        animFrameRef.current = requestAnimationFrame(draw);
      }
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive]);

  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto rounded-xl overflow-hidden">
      {/* Baby photo */}
      <img
        src={imageUrl}
        alt="분석 중인 아기 사진"
        className="w-full h-full object-cover"
      />

      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="absolute inset-0 w-full h-full"
      />

      {/* Scan frame corners */}
      <div className="absolute inset-4 pointer-events-none">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-400" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-400" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-400" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-400" />
      </div>
    </div>
  );
}
