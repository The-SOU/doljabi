"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import type { MatchResult } from "@/lib/matching";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

interface OccupationRadarChartProps {
  matches: MatchResult[];
}

export default function OccupationRadarChart({ matches }: OccupationRadarChartProps) {
  const data = {
    labels: matches.map((m) => `${m.occupation.emoji} ${m.occupation.nameKo}`),
    datasets: [
      {
        label: "적합도 (%)",
        data: matches.map((m) => m.percentage),
        backgroundColor: "rgba(245, 158, 11, 0.15)",
        borderColor: "rgba(245, 158, 11, 0.8)",
        pointBackgroundColor: matches.map((m, i) =>
          i === 0 ? "#f59e0b" : "rgba(245, 158, 11, 0.5)"
        ),
        pointBorderColor: matches.map((m, i) =>
          i === 0 ? "#fbbf24" : "transparent"
        ),
        pointRadius: matches.map((m, i) => (i === 0 ? 6 : 3)),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          display: false,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        angleLines: {
          color: "rgba(255, 255, 255, 0.08)",
        },
        pointLabels: {
          color: "rgba(255, 255, 255, 0.7)",
          font: {
            size: 10,
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: { raw: unknown }) => `적합도: ${context.raw}%`,
        },
      },
    },
    animation: {
      duration: 1500,
      easing: "easeOutQuart" as const,
    },
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      <Radar data={data} options={options} />
    </div>
  );
}
