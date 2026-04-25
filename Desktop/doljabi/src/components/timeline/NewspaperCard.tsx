"use client";

import { motion } from "framer-motion";
import type { TimelineEvent } from "@/lib/gemini";

interface NewspaperCardProps {
  event: TimelineEvent;
  index: number;
  isLeft: boolean;
}

export default function NewspaperCard({ event, index, isLeft }: NewspaperCardProps) {
  // Older events get more yellowed
  const yearsSince = event.year - 2025;
  const sepiaIntensity = Math.max(0, 1 - yearsSince / 35);

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30, y: 20 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative max-w-sm ${isLeft ? "mr-auto" : "ml-auto"}`}
    >
      <div
        className="rounded-lg border shadow-lg overflow-hidden"
        style={{
          backgroundColor: `rgb(${255 - sepiaIntensity * 10}, ${248 - sepiaIntensity * 15}, ${235 - sepiaIntensity * 20})`,
          borderColor: `rgba(180, 160, 130, ${0.3 + sepiaIntensity * 0.3})`,
          transform: `rotate(${(Math.random() - 0.5) * 2}deg)`,
        }}
      >
        {/* Newspaper header */}
        <div className="border-b border-gray-300 px-4 py-2 flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-700 tracking-wider">
            {event.newspaper}
          </span>
          <span className="text-[9px] text-gray-500">
            {event.year}년
          </span>
        </div>

        {/* Article content */}
        <div className="p-4">
          {/* Age badge */}
          <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded-full mb-2">
            {event.age}세
          </span>

          {/* Headline */}
          <h3 className="text-base font-bold text-gray-900 leading-snug mb-2 font-serif">
            {event.headline}
          </h3>

          {/* Body */}
          <p className="text-xs text-gray-600 leading-relaxed mb-2">
            {event.body}
          </p>

          {/* Reporter */}
          <p className="text-[9px] text-gray-400">
            {event.reporter} 기자
          </p>
        </div>
      </div>
    </motion.div>
  );
}
