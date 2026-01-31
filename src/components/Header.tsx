"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getCurrentUser, UserProfile } from "./PasswordGate";

export default function Header() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    if (confirm("Switch to a different account?")) {
      localStorage.removeItem("eliavigram_user");
      window.location.reload();
    }
  };

  return (
    <header className="relative overflow-hidden">
      {/* Skeuomorphic leather banner - Instagram vintage style */}
      <div className="relative bg-gradient-to-b from-[#4A6B8A] via-[#3D5A73] to-[#2C4356] py-6 md:py-8 shadow-xl">
        {/* Leather texture overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Top highlight stitching line */}
        <div className="absolute top-3 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#6B8BA8]/50 to-transparent" />
        <div
          className="absolute top-[14px] left-8 right-8 h-px opacity-60"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, #1a1a1a 0px, #1a1a1a 4px, transparent 4px, transparent 8px)`,
          }}
        />

        {/* Bottom stitching line */}
        <div className="absolute bottom-3 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#1a1a1a]/30 to-transparent" />
        <div
          className="absolute bottom-[14px] left-8 right-8 h-px opacity-60"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, #1a1a1a 0px, #1a1a1a 4px, transparent 4px, transparent 8px)`,
          }}
        />

        {/* Inner shadow effect */}
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-black/20 to-transparent" />

        <motion.div
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Retro camera icon badge */}
          <motion.div
            className="inline-flex items-center gap-3"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.div
              className="relative"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] shadow-lg flex items-center justify-center border border-[#3a3a3a]">
                <span className="text-xl md:text-2xl">📷</span>
              </div>
              {/* Camera lens shine */}
              <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/20" />
            </motion.div>

            {/* Title with embossed look */}
            <div>
              <h1
                className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight text-white"
                style={{
                  textShadow: "0 2px 4px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                Eliavigram
              </h1>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Cream colored content area below banner */}
      <div className="bg-gradient-to-b from-[#FAF8F5] to-[#FFFDF7] py-6 md:py-8 text-center">
        <motion.p
          className="font-sans text-xs md:text-sm text-[#8B7355] font-medium tracking-[0.25em] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          A little photographer&apos;s gallery
        </motion.p>

        {/* User greeting */}
        {currentUser && (
          <motion.div
            className="mt-4 flex items-center justify-center gap-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-[#E8DDD4]">
              {/* Profile pic */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E8B4B8] to-[#A8D8EA] flex items-center justify-center overflow-hidden">
                {currentUser.profilePicUrl ? (
                  <Image
                    src={currentUser.profilePicUrl}
                    alt={currentUser.name}
                    width={28}
                    height={28}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-xs font-medium text-white">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm text-[#4A4A4A]">
                Hi, <span className="font-medium">{currentUser.name}</span>!
              </span>
              <motion.button
                onClick={handleLogout}
                className="ml-1 text-xs text-[#A0A0A0] hover:text-[#6B6B6B] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Switch account"
              >
                👋
              </motion.button>
            </div>
          </motion.div>
        )}

        <motion.div
          className="mt-4 flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <motion.span
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-lg"
          >
            👇
          </motion.span>
          <p className="font-serif italic text-[#6B6B6B] text-sm md:text-base">
            Check out the polaroids
          </p>
          <motion.span
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm"
          >
            ✨
          </motion.span>
        </motion.div>
      </div>
    </header>
  );
}
