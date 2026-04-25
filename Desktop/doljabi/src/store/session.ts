import { create } from "zustand";
import type { MatchResult } from "@/lib/matching";
import type { TimelineEvent } from "@/lib/gemini";

export type Act = 0 | 1 | 2 | 3 | 4 | 5;

interface SessionState {
  // Upload
  babyImage: string | null; // base64 data URL
  babyImageFile: File | null;

  // Flow
  currentAct: Act;

  // Analysis results
  analysisResult: {
    topOccupation: MatchResult;
    allMatches: MatchResult[];
    gwansangText: string;
    faceDescription: string;
    featureVector: number[];
  } | null;

  // Generated images
  generatedFaces: Record<number, string>; // age -> base64
  agedFaceLoading: boolean;

  // Timeline
  timelineEvents: TimelineEvent[];
  timelineLoading: boolean;

  // Actions
  setBabyImage: (image: string, file: File) => void;
  setCurrentAct: (act: Act) => void;
  setAnalysisResult: (result: SessionState["analysisResult"]) => void;
  setGeneratedFace: (age: number, base64: string) => void;
  setAgedFaceLoading: (loading: boolean) => void;
  setTimelineEvents: (events: TimelineEvent[]) => void;
  setTimelineLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  babyImage: null,
  babyImageFile: null,
  currentAct: 0 as Act,
  analysisResult: null,
  generatedFaces: {},
  agedFaceLoading: false,
  timelineEvents: [],
  timelineLoading: false,
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,

  setBabyImage: (image, file) => set({ babyImage: image, babyImageFile: file }),
  setCurrentAct: (act) => set({ currentAct: act }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setGeneratedFace: (age, base64) =>
    set((state) => ({
      generatedFaces: { ...state.generatedFaces, [age]: base64 },
    })),
  setAgedFaceLoading: (loading) => set({ agedFaceLoading: loading }),
  setTimelineEvents: (events) => set({ timelineEvents: events }),
  setTimelineLoading: (loading) => set({ timelineLoading: loading }),
  reset: () => set(initialState),
}));
