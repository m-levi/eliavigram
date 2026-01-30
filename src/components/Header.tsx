"use client";

import { motion } from "framer-motion";

export default function Header() {
  return (
    <header className="py-16 md:py-20 text-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tight text-[#2D2D2D]"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Eliavigram
        </motion.h1>
        <motion.div
          className="flex items-center justify-center gap-3 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-2xl"
          >
            📸
          </motion.span>
          <p className="font-sans text-base md:text-lg text-[#6B6B6B] font-light tracking-wide">
            A little photographer&apos;s gallery
          </p>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            className="text-xl"
          >
            ✨
          </motion.span>
        </motion.div>
      </motion.div>
    </header>
  );
}
