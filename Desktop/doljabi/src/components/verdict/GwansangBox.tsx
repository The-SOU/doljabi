"use client";

interface GwansangBoxProps {
  text: string;
}

export default function GwansangBox({ text }: GwansangBoxProps) {
  return (
    <div className="relative bg-amber-950/30 border border-amber-900/50 rounded-xl p-6">
      {/* Corner decoration */}
      <div className="absolute top-2 left-2 text-amber-700/30 text-xs">◆</div>
      <div className="absolute top-2 right-2 text-amber-700/30 text-xs">◆</div>
      <div className="absolute bottom-2 left-2 text-amber-700/30 text-xs">◆</div>
      <div className="absolute bottom-2 right-2 text-amber-700/30 text-xs">◆</div>

      {/* Title */}
      <div className="text-center mb-4">
        <span className="text-amber-600 text-xs tracking-widest">
          ── 觀 相 學 的  根 據 ──
        </span>
      </div>

      {/* Text */}
      <p className="text-amber-200/80 text-sm md:text-base leading-relaxed font-serif">
        {text}
      </p>

      {/* Signature */}
      <div className="text-right mt-4">
        <span className="text-amber-700/50 text-[10px] font-mono">
          — Gemini 관상학연구소 수석연구원 AI
        </span>
      </div>
    </div>
  );
}
