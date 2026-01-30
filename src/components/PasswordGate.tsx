"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface PasswordGateProps {
  children: React.ReactNode;
}

export interface UserProfile {
  name: string;
  profilePicUrl?: string;
}

const PASSWORD = "eat";
const STORAGE_KEY = "eliavigram_user";

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function updateUserProfile(profile: Partial<UserProfile>): UserProfile | null {
  const current = getCurrentUser();
  if (!current) return null;
  const updated = { ...current, ...profile };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [step, setStep] = useState<"loading" | "password" | "name" | "authenticated">("loading");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = getCurrentUser();
    if (stored && stored.name) {
      setStep("authenticated");
    } else {
      setStep("password");
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === PASSWORD) {
      setStep("name");
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword("");
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const userProfile: UserProfile = {
        name: name.trim(),
        profilePicUrl: profilePicPreview || undefined,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile));
      setStep("authenticated");
    }
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPic(true);

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicPreview(reader.result as string);
      setIsUploadingPic(false);
    };
    reader.readAsDataURL(file);
  };

  // Loading state
  if (step === "loading") {
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

  // Password step
  if (step === "password") {
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
            className="bg-gradient-to-b from-[#3D5A73] to-[#2C4356] rounded-xl p-8 shadow-2xl border border-[#4A6B8A]/50 relative overflow-hidden"
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

            {/* Fun camera icon with sparkles */}
            <motion.div
              className="text-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] shadow-lg border border-[#3a3a3a] relative">
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  📷
                </motion.span>
                <motion.span
                  className="absolute -top-1 -right-1 text-lg"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.8, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ✨
                </motion.span>
              </div>
            </motion.div>

            {/* Title */}
            <h1
              className="text-center font-serif text-3xl text-white mb-2"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.4)" }}
            >
              Eliavigram
            </h1>

            {/* Fun question */}
            <motion.p
              className="text-center text-[#A8C4D8] text-base mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Psst... what&apos;s the magic word?
            </motion.p>
            <motion.p
              className="text-center text-[#7BA3C4] text-sm mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              (Hint: What does Eliav LOVE to do? 🍽️)
            </motion.p>

            {/* Password form */}
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    placeholder="Type the magic word..."
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
                        Oopsie! That&apos;s not it... try again! 🙈
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
                  Let me in! 🎉
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Name step
  if (step === "name") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#4A6B8A] to-[#2C4356] flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          {/* Success celebration */}
          <motion.div
            className="text-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          >
            <motion.span
              className="text-5xl inline-block"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 1, repeat: 2 }}
            >
              🎊
            </motion.span>
          </motion.div>

          {/* Name card */}
          <motion.div
            className="bg-gradient-to-b from-[#3D5A73] to-[#2C4356] rounded-xl p-8 shadow-2xl border border-[#4A6B8A]/50 relative overflow-hidden"
          >
            {/* Stitching effect */}
            <div
              className="absolute top-4 left-6 right-6 h-px opacity-40"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, #1a1a1a 0px, #1a1a1a 4px, transparent 4px, transparent 8px)`,
              }}
            />

            <motion.h2
              className="text-center font-serif text-2xl text-white mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              You got it! 🌟
            </motion.h2>

            <motion.p
              className="text-center text-[#A8C4D8] text-base mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Now, what&apos;s your name, friend?
            </motion.p>

            {/* Profile picture upload */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div
                className="relative cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`w-24 h-24 rounded-full border-4 border-dashed border-[#4A6B8A] flex items-center justify-center overflow-hidden transition-colors group-hover:border-[#A8D8EA] ${profilePicPreview ? 'border-solid' : ''}`}>
                  {isUploadingPic ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ⏳
                    </motion.div>
                  ) : profilePicPreview ? (
                    <Image
                      src={profilePicPreview}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <span className="text-3xl">📸</span>
                      <p className="text-[#7BA3C4] text-xs mt-1">Add photo</p>
                    </div>
                  )}
                </div>
                {profilePicPreview && (
                  <motion.div
                    className="absolute -bottom-1 -right-1 bg-[#A8D8EA] rounded-full w-7 h-7 flex items-center justify-center shadow-md"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    ✓
                  </motion.div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
              </div>
            </motion.div>
            <p className="text-center text-[#6B8BA8] text-xs mb-4">
              (Optional: Add a cute profile pic!)
            </p>

            {/* Name form */}
            <form onSubmit={handleNameSubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name..."
                  className="w-full px-4 py-3 rounded-lg bg-[#1a1a1a]/50 border border-[#4A6B8A]/30 text-white placeholder-[#6B8BA8] focus:outline-none focus:border-[#A8C4D8] transition-colors text-center font-serif text-lg"
                  autoFocus
                />

                <motion.button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full py-3 bg-gradient-to-r from-[#E8B4B8] to-[#A8D8EA] text-[#2D2D2D] rounded-lg font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: name.trim() ? 1.02 : 1 }}
                  whileTap={{ scale: name.trim() ? 0.98 : 1 }}
                >
                  Enter the Gallery! 🖼️
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Authenticated - show children
  return <>{children}</>;
}
