"use client";

import { motion } from "framer-motion";

export default function ClassifiedStamp() {
  const rotation = -5 + Math.random() * 10;

  return (
    <motion.div
      initial={{ scale: 3, opacity: 0, rotate: rotation + 30 }}
      animate={{ scale: 1, opacity: 1, rotate: rotation }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 15,
        duration: 0.5,
      }}
      className="absolute -top-3 -right-3 md:top-2 md:right-2 z-10"
    >
      <div className="border-4 border-red-600 rounded-md px-3 py-1.5 bg-transparent">
        <div className="text-red-600 font-black text-lg md:text-xl tracking-wider whitespace-nowrap">
          대 외 비
        </div>
        <div className="text-red-600/70 text-[8px] text-center tracking-widest">
          CONFIDENTIAL
        </div>
      </div>
    </motion.div>
  );
}
