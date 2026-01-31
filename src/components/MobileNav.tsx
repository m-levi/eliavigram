"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  onStoriesClick?: () => void;
  hasNewPhotos?: boolean;
}

export default function MobileNav({ onStoriesClick, hasNewPhotos }: MobileNavProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdd = pathname === "/add";

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-[#E8DDD4]/50" />

      {/* Safe area spacer for notched phones */}
      <div className="relative flex items-center justify-around px-6 py-2 pb-safe">
        {/* Home/Gallery */}
        <Link href="/" className="flex-1">
          <motion.div
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-colors ${
              isHome ? "bg-[#4A6B8A]/10" : ""
            }`}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              className="relative"
              animate={isHome ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <svg
                className={`w-6 h-6 ${isHome ? "text-[#4A6B8A]" : "text-[#6B6B6B]"}`}
                fill={isHome ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={isHome ? 0 : 1.5}
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              {hasNewPhotos && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#E8B4B8] rounded-full" />
              )}
            </motion.div>
            <span className={`text-[10px] font-medium ${isHome ? "text-[#4A6B8A]" : "text-[#6B6B6B]"}`}>
              Home
            </span>
          </motion.div>
        </Link>

        {/* Stories */}
        <motion.button
          onClick={onStoriesClick}
          className="flex-1"
          whileTap={{ scale: 0.9 }}
        >
          <div className="flex flex-col items-center gap-1 py-2 px-4">
            <div className="relative">
              <div className="w-6 h-6 rounded-full border-2 border-dashed border-[#6B6B6B] flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-[#6B6B6B]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
            </div>
            <span className="text-[10px] font-medium text-[#6B6B6B]">Stories</span>
          </div>
        </motion.button>

        {/* Add Photo - Center prominent button */}
        <Link href="/add" className="flex-1 flex justify-center -mt-4">
          <motion.div
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
              isAdd
                ? "bg-gradient-to-br from-[#4A6B8A] to-[#3D5A73]"
                : "bg-gradient-to-br from-[#E8B4B8] to-[#D4A4A8]"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={isAdd ? {} : {
              boxShadow: [
                "0 4px 15px rgba(232, 180, 184, 0.4)",
                "0 4px 25px rgba(232, 180, 184, 0.6)",
                "0 4px 15px rgba(232, 180, 184, 0.4)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </motion.div>
        </Link>

        {/* Search/Explore */}
        <motion.button
          className="flex-1"
          whileTap={{ scale: 0.9 }}
        >
          <div className="flex flex-col items-center gap-1 py-2 px-4">
            <svg
              className="w-6 h-6 text-[#6B6B6B]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <span className="text-[10px] font-medium text-[#6B6B6B]">Search</span>
          </div>
        </motion.button>

        {/* Profile/Settings */}
        <motion.button
          className="flex-1"
          whileTap={{ scale: 0.9 }}
        >
          <div className="flex flex-col items-center gap-1 py-2 px-4">
            <svg
              className="w-6 h-6 text-[#6B6B6B]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            <span className="text-[10px] font-medium text-[#6B6B6B]">Profile</span>
          </div>
        </motion.button>
      </div>
    </motion.nav>
  );
}
