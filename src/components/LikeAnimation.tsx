"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LikeAnimationProps {
  show: boolean;
  variant?: number;
}

// Different animation variations
const animations = [
  // Variant 0: Classic big heart
  {
    emoji: "❤️",
    type: "single",
  },
  // Variant 1: Heart explosion
  {
    emoji: "💕",
    type: "burst",
    extras: ["💗", "💖", "💓", "💘", "💝"],
  },
  // Variant 2: Sparkle hearts
  {
    emoji: "💖",
    type: "sparkle",
    extras: ["✨", "⭐", "💫", "🌟"],
  },
  // Variant 3: Floating hearts
  {
    emoji: "🥰",
    type: "float",
    extras: ["❤️", "🧡", "💛", "💚", "💙", "💜"],
  },
  // Variant 4: Love explosion
  {
    emoji: "😍",
    type: "explosion",
    extras: ["💕", "💞", "💓", "💗", "💖", "💘"],
  },
  // Variant 5: Cute combo
  {
    emoji: "🥹",
    type: "combo",
    extras: ["💕", "✨", "🌸", "💖"],
  },
  // Variant 6: Star burst
  {
    emoji: "⭐",
    type: "starburst",
    extras: ["✨", "💫", "🌟", "⭐", "💖"],
  },
  // Variant 7: Rainbow hearts
  {
    emoji: "🌈",
    type: "rainbow",
    extras: ["❤️", "🧡", "💛", "💚", "💙", "💜", "💖"],
  },
];

export function getRandomVariant(): number {
  return Math.floor(Math.random() * animations.length);
}

export default function LikeAnimation({ show, variant = 0 }: LikeAnimationProps) {
  const animation = animations[variant % animations.length];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Main emoji */}
          {animation.type === "single" && (
            <motion.span
              className="text-8xl drop-shadow-lg"
              initial={{ scale: 0, rotate: -20 }}
              animate={{
                scale: [0, 1.4, 1.1],
                rotate: [-20, 10, 0],
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "backOut" }}
            >
              {animation.emoji}
            </motion.span>
          )}

          {/* Burst animation */}
          {animation.type === "burst" && (
            <>
              <motion.span
                className="text-7xl drop-shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1.2] }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {animation.emoji}
              </motion.span>
              {animation.extras?.map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-3xl"
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1.2, 0],
                    x: Math.cos((i * 2 * Math.PI) / animation.extras!.length) * 100,
                    y: Math.sin((i * 2 * Math.PI) / animation.extras!.length) * 100,
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </>
          )}

          {/* Sparkle animation */}
          {animation.type === "sparkle" && (
            <>
              <motion.span
                className="text-7xl drop-shadow-lg"
                initial={{ scale: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1.3, 1],
                  rotate: [0, -10, 10, 0],
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {animation.emoji}
              </motion.span>
              {animation.extras?.map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180],
                  }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </>
          )}

          {/* Float animation */}
          {animation.type === "float" && (
            <>
              <motion.span
                className="text-6xl drop-shadow-lg"
                initial={{ scale: 0, y: 0 }}
                animate={{ scale: [0, 1.2, 1], y: [0, -20, 0] }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {animation.emoji}
              </motion.span>
              {animation.extras?.map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl"
                  initial={{
                    scale: 0,
                    y: 50,
                    x: (i - animation.extras!.length / 2) * 30,
                  }}
                  animate={{
                    scale: [0, 1, 0.5],
                    y: [50, -80 - i * 15],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 0.8, delay: i * 0.08 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </>
          )}

          {/* Explosion animation */}
          {animation.type === "explosion" && (
            <>
              <motion.span
                className="text-6xl drop-shadow-lg"
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 2, 1.5],
                  rotate: [0, -15, 15, 0],
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "backOut" }}
              >
                {animation.emoji}
              </motion.span>
              {animation.extras?.map((emoji, i) => {
                const angle = (i * 2 * Math.PI) / animation.extras!.length;
                const distance = 80 + Math.random() * 40;
                return (
                  <motion.span
                    key={i}
                    className="absolute text-2xl"
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1.2, 0.3],
                      x: Math.cos(angle) * distance,
                      y: Math.sin(angle) * distance,
                      opacity: [0, 1, 0],
                      rotate: [0, 360],
                    }}
                    transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
                  >
                    {emoji}
                  </motion.span>
                );
              })}
            </>
          )}

          {/* Combo animation */}
          {animation.type === "combo" && (
            <>
              <motion.div
                className="flex items-center gap-2"
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: [0, 1.2, 1], y: [20, -10, 0] }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.span
                  className="text-6xl drop-shadow-lg"
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 0.3, repeat: 2 }}
                >
                  {animation.emoji}
                </motion.span>
              </motion.div>
              {animation.extras?.map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-3xl"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.3, 0],
                    opacity: [0, 1, 0],
                    x: (i - 1.5) * 50,
                    y: -40 - Math.abs(i - 1.5) * 20,
                  }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </>
          )}

          {/* Star burst animation */}
          {animation.type === "starburst" && (
            <>
              <motion.span
                className="text-7xl drop-shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: [0, 1.5, 1.2],
                  rotate: [-180, 0],
                }}
                exit={{ scale: 0, opacity: 0, rotate: 180 }}
                transition={{ duration: 0.5 }}
              >
                {animation.emoji}
              </motion.span>
              {animation.extras?.map((emoji, i) => {
                const angle = (i * 2 * Math.PI) / animation.extras!.length - Math.PI / 2;
                return (
                  <motion.span
                    key={i}
                    className="absolute text-xl"
                    initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1, 0.5],
                      x: [0, Math.cos(angle) * 70, Math.cos(angle) * 120],
                      y: [0, Math.sin(angle) * 70, Math.sin(angle) * 120],
                      opacity: [0, 1, 0],
                    }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                  >
                    {emoji}
                  </motion.span>
                );
              })}
            </>
          )}

          {/* Rainbow animation */}
          {animation.type === "rainbow" && (
            <>
              <motion.span
                className="text-6xl drop-shadow-lg"
                initial={{ scale: 0, y: 30 }}
                animate={{
                  scale: [0, 1.3, 1],
                  y: [30, -10, 0],
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {animation.emoji}
              </motion.span>
              {animation.extras?.map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl"
                  initial={{ scale: 0, y: 0, x: 0 }}
                  animate={{
                    scale: [0, 1, 0.7],
                    y: [0, -60 - i * 8],
                    x: (i - 3) * 25,
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 0.7, delay: i * 0.06 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
