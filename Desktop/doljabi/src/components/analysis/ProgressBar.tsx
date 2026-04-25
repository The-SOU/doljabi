"use client";

interface ProgressBarProps {
  progress: number;    // 0-100
  label: string;
  isStalled?: boolean; // 73%에서 멈추는 연출
}

export default function ProgressBar({ progress, label, isStalled }: ProgressBarProps) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background:
              isStalled
                ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                : progress >= 100
                ? "linear-gradient(90deg, #22c55e, #10b981)"
                : "linear-gradient(90deg, #f59e0b, #f97316)",
          }}
        />
      </div>

      {/* Label */}
      <div className="flex justify-between items-center mt-2">
        <span
          className={`text-xs ${
            isStalled
              ? "text-red-400 animate-pulse"
              : progress >= 100
              ? "text-green-400"
              : "text-gray-400"
          }`}
        >
          {label}
        </span>
        <span className="text-xs text-gray-500 font-mono">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
