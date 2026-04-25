"use client";

import { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session";
import FakeAnalysis from "@/components/analysis/FakeAnalysis";
import FaceReveal from "@/components/reveal/FaceReveal";
import CareerVerdict from "@/components/verdict/CareerVerdict";
import CareerTimeline from "@/components/timeline/CareerTimeline";
import SharePanel from "@/components/share/SharePanel";

export default function AnalyzePage() {
  const currentAct = useSessionStore((s) => s.currentAct);
  const setCurrentAct = useSessionStore((s) => s.setCurrentAct);
  const babyImage = useSessionStore((s) => s.babyImage);
  const router = useRouter();

  // Redirect if no image
  useEffect(() => {
    if (!babyImage) {
      router.push("/");
    } else {
      setCurrentAct(1);
    }
  }, [babyImage, router, setCurrentAct]);

  const goToAct2 = useCallback(() => setCurrentAct(2), [setCurrentAct]);
  const goToAct3 = useCallback(() => setCurrentAct(3), [setCurrentAct]);
  const goToAct4 = useCallback(() => setCurrentAct(4), [setCurrentAct]);
  const goToAct5 = useCallback(() => setCurrentAct(5), [setCurrentAct]);

  if (!babyImage) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white py-8 md:py-12">
      <AnimatePresence mode="wait">
        {currentAct === 1 && (
          <motion.div
            key="act1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FakeAnalysis onComplete={goToAct2} />
          </motion.div>
        )}

        {currentAct === 2 && (
          <motion.div
            key="act2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <FaceReveal onComplete={goToAct3} />
          </motion.div>
        )}

        {currentAct === 3 && (
          <motion.div
            key="act3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CareerVerdict onComplete={goToAct4} />
          </motion.div>
        )}

        {currentAct === 4 && (
          <motion.div
            key="act4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CareerTimeline onComplete={goToAct5} />
          </motion.div>
        )}

        {currentAct === 5 && (
          <motion.div
            key="act5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <SharePanel />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
