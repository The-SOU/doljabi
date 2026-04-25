import PhotoUpload from "@/components/upload/PhotoUpload";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-lg mx-auto px-6 py-12 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            제미나이 돌잡이
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            AI 관상학으로 보는 우리 아이의 30년 후
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
            <span className="px-2 py-1 bg-gray-800 rounded-full">Powered by Gemini</span>
            <span className="px-2 py-1 bg-gray-800 rounded-full">관상학 v2.7</span>
          </div>
        </div>

        {/* Occupation Grid */}
        <div className="grid grid-cols-5 gap-3 mb-10 w-full">
          {[
            { emoji: "🩺", name: "의사" },
            { emoji: "⚖️", name: "변호사" },
            { emoji: "🔬", name: "과학자" },
            { emoji: "💼", name: "CEO" },
            { emoji: "🎬", name: "유튜버" },
            { emoji: "🎤", name: "아이돌" },
            { emoji: "⚽", name: "축구선수" },
            { emoji: "👨‍🍳", name: "셰프" },
            { emoji: "🏛️", name: "대통령" },
            { emoji: "🔨", name: "판사" },
          ].map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-800/50"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-[10px] text-gray-400">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Upload */}
        <PhotoUpload />

        {/* Disclaimer */}
        <p className="mt-8 text-[10px] text-gray-700 text-center leading-relaxed">
          본 서비스는 엔터테인먼트 목적으로 제작되었으며,
          <br />
          AI의 분석 결과는 과학적 근거가 전혀 없습니다.
          <br />
          &ldquo;쓸모없는 AI 만들기&rdquo; 해커톤 출품작
        </p>
      </div>
    </main>
  );
}
