"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordGateProps {
  children: React.ReactNode;
}

const PASSWORD = "eat";
const STORAGE_KEY = "eliavigram_auth";

export default function PasswordGate({ children }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const stored = localStorage.getItem(STORAGE_KEY);
    setIsAuthenticated(stored === "true");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsAuthenticated(true);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword("");
    }
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          📷
        </motion.div>
      </div>
    );
  }

  // Password gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#4A6B8A] to-[#2C4356] flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Vintage leather card */}
          <motion.div
            className="bg-gradient-to-b from-[#3D5A73] to-[#2C4356] rounded-xl p-8 shadow-2xl border border-[#4A6B8A]/50"
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            {/* Stitching effect */}
            <div
              className="absolute top-4 left-6 right-6 h-px opacity-40"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, #1a1a1a 0px, #1a1a1a 4px, transparent 4px, transparent 8px)`,
              }}
            />

            {/* Camera icon */}
            <motion.div
              className="text-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] shadow-lg border border-[#3a3a3a]">
                <span className="text-3xl">📷</span>
              </div>
            </motion.div>

            {/* Title */}
            <h1
              className="text-center font-serif text-3xl text-white mb-2"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.4)" }}
            >
              Eliavigram
            </h1>
            <p className="text-center text-[#A8C4D8] text-sm mb-8">
              Enter the secret word to continue
            </p>

            {/* Password form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    placeholder="Secret word..."
                    className="w-full px-4 py-3 rounded-lg bg-[#1a1a1a]/50 border border-[#4A6B8A]/30 text-white placeholder-[#6B8BA8] focus:outline-none focus:border-[#A8C4D8] transition-colors text-center font-serif text-lg"
                    autoFocus
                  />
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        className="text-[#E8B4B8] text-sm text-center mt-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        Oops! Try again
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#E8B4B8] to-[#A8D8EA] text-[#2D2D2D] rounded-lg font-medium shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Enter Gallery
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Hint */}
          <motion.p
            className="text-center text-[#6B8BA8]/60 text-xs mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Hint: What does Eliav love to do?
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Authenticated - show children
  return <>{children}</>;
}
