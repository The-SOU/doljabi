export interface Occupation {
  id: string;
  nameKo: string;
  nameEn: string;
  emoji: string;
  doljabiItem: string;
  averageFaceUrl: string;
  featureVector: number[];
  gwansangKeywords: string[];
}

export const occupations: Occupation[] = [
  {
    id: "doctor",
    nameKo: "의사",
    nameEn: "Doctor",
    emoji: "🩺",
    doljabiItem: "청진기",
    averageFaceUrl: "/data/occupations/doctor-face.png",
    featureVector: [0.72, 0.65, 0.81, 0.55, 0.48, 0.63, 0.70, 0.85, 0.60, 0.58],
    gwansangKeywords: ["천정(天庭)이 넓고 맑아", "인당(印堂)이 환하여", "의술(醫術)의 천부적 재능"],
  },
  {
    id: "lawyer",
    nameKo: "변호사",
    nameEn: "Lawyer",
    emoji: "⚖️",
    doljabiItem: "법전",
    averageFaceUrl: "/data/occupations/lawyer-face.png",
    featureVector: [0.68, 0.72, 0.75, 0.60, 0.55, 0.78, 0.65, 0.70, 0.58, 0.80],
    gwansangKeywords: ["관골(觀骨)이 발달하여", "눈매가 날카로워", "논변(論辯)의 기운이 서려"],
  },
  {
    id: "scientist",
    nameKo: "과학자",
    nameEn: "Scientist",
    emoji: "🔬",
    doljabiItem: "돋보기",
    averageFaceUrl: "/data/occupations/scientist-face.png",
    featureVector: [0.80, 0.58, 0.88, 0.50, 0.42, 0.55, 0.75, 0.90, 0.72, 0.45],
    gwansangKeywords: ["이마가 유난히 넓어", "미간에 지혜의 문(智慧門)이 열려", "탐구의 상(相)"],
  },
  {
    id: "ceo",
    nameKo: "CEO",
    nameEn: "CEO",
    emoji: "💼",
    doljabiItem: "명함",
    averageFaceUrl: "/data/occupations/ceo-face.png",
    featureVector: [0.75, 0.70, 0.70, 0.65, 0.60, 0.85, 0.80, 0.65, 0.55, 0.72],
    gwansangKeywords: ["턱이 각지고 단단하여", "관록궁(官祿宮)이 풍만하여", "제왕의 기운이 서린"],
  },
  {
    id: "youtuber",
    nameKo: "100만 유튜버",
    nameEn: "YouTuber",
    emoji: "🎬",
    doljabiItem: "골드버튼",
    averageFaceUrl: "/data/occupations/youtuber-face.png",
    featureVector: [0.55, 0.80, 0.60, 0.75, 0.85, 0.50, 0.45, 0.55, 0.78, 0.65],
    gwansangKeywords: ["입이 크고 복덕방(福德房)이 넓어", "눈에 광채가 서려", "만인을 사로잡을 상(相)"],
  },
  {
    id: "idol",
    nameKo: "아이돌",
    nameEn: "K-Pop Idol",
    emoji: "🎤",
    doljabiItem: "마이크",
    averageFaceUrl: "/data/occupations/idol-face.png",
    featureVector: [0.50, 0.88, 0.55, 0.82, 0.90, 0.42, 0.40, 0.50, 0.85, 0.70],
    gwansangKeywords: ["오악(五嶽)이 단정하고", "도화살(桃花殺)이 강하여", "천하의 인기를 끌 상(相)"],
  },
  {
    id: "soccer",
    nameKo: "축구선수",
    nameEn: "Soccer Player",
    emoji: "⚽",
    doljabiItem: "축구공",
    averageFaceUrl: "/data/occupations/soccer-face.png",
    featureVector: [0.60, 0.75, 0.58, 0.70, 0.72, 0.68, 0.55, 0.48, 0.65, 0.62],
    gwansangKeywords: ["광대뼈가 발달하고", "눈에 투지의 불꽃이 타올라", "신체의 기운이 왕성한 상(相)"],
  },
  {
    id: "chef",
    nameKo: "셰프",
    nameEn: "Chef",
    emoji: "👨‍🍳",
    doljabiItem: "요리모자",
    averageFaceUrl: "/data/occupations/chef-face.png",
    featureVector: [0.58, 0.62, 0.55, 0.78, 0.65, 0.52, 0.60, 0.58, 0.70, 0.75],
    gwansangKeywords: ["코끝(準頭)이 풍만하여 식복(食福)이 왕성하고", "양 볼의 살집이", "미각의 천재적 감각을 시사하는 상(相)"],
  },
  {
    id: "president",
    nameKo: "대통령",
    nameEn: "President",
    emoji: "🏛️",
    doljabiItem: "태극기",
    averageFaceUrl: "/data/occupations/president-face.png",
    featureVector: [0.85, 0.68, 0.82, 0.58, 0.52, 0.90, 0.88, 0.78, 0.50, 0.85],
    gwansangKeywords: ["천정(天庭)에서 용의 기운이 서리고", "관록궁(官祿宮)이 천하를 호령할", "제왕지상(帝王之相)"],
  },
  {
    id: "judge",
    nameKo: "판사",
    nameEn: "Judge",
    emoji: "🔨",
    doljabiItem: "법봉",
    averageFaceUrl: "/data/occupations/judge-face.png",
    featureVector: [0.78, 0.60, 0.80, 0.52, 0.45, 0.82, 0.72, 0.82, 0.55, 0.88],
    gwansangKeywords: ["미간이 곧고 정직하여", "눈에 준엄한 기운이 서려", "시비(是非)를 가리는 명관(名官)의 상(相)"],
  },
];

export function getOccupationById(id: string): Occupation | undefined {
  return occupations.find((o) => o.id === id);
}
