"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Photo } from "@/lib/types";

interface PolaroidProps {
  photo: Photo;
  index: number;
  size?: 1 | 2 | 3;
  isNew?: boolean;
  onClick?: () => void;
}

export default function Polaroid({ photo, index, size = 3, isNew = false, onClick }: PolaroidProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Generate consistent but varied rotation based on photo id and index
  const rotation = useMemo(() => {
    const seed = photo.id.charCodeAt(0) + photo.id.charCodeAt(photo.id.length - 1) + index;
    // Rotations between -6 and 6 degrees
    const rotations = [-6, -4, -2, -1, 0, 1, 2, 4, 6, -3, 3, -5, 5, -1.5, 1.5];
    return rotations[seed % rotations.length];
  }, [photo.id, index]);

  // Slight vertical offset for scattered look
  const offsetY = useMemo(() => {
    const seed = photo.id.charCodeAt(1) || 0;
    return (seed % 16) - 8; // -8px to +8px
  }, [photo.id]);

  // Adjust animation delay based on grid size for smoother loading
  const staggerDelay = size === 1 ? 0.15 : size === 2 ? 0.1 : 0.08;

  return (
    <motion.div
      className="polaroid-container relative"
      layout
      initial={{ opacity: 0, y: 30, rotate: rotation * 1.5, scale: 0.95 }}
      whileInView={{
        opacity: 1,
        y: offsetY,
        rotate: rotation,
        scale: 1,
      }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * staggerDelay, 0.6),
        type: "spring",
        stiffness: 120,
        damping: 18,
      }}
      whileHover={{
        scale: 1.03,
        rotate: 0,
        y: offsetY - 6,
        zIndex: 10,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      onClick={onClick}
    >
      <motion.div
        className="polaroid cursor-pointer relative"
        whileTap={{ scale: 0.98 }}
      >
        {/* Film grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none z-10 rounded-sm"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* NEW badge */}
        {isNew && (
          <motion.div
            className="absolute -top-2 -right-2 z-20"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: index * 0.05 }}
          >
            <div className="bg-gradient-to-r from-[#E8B4B8] to-[#F0C4C8] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
              NEW ✨
            </div>
          </motion.div>
        )}

        {/* Photo container */}
        <div className="relative w-full aspect-square overflow-hidden bg-[#F0EDE8]">
          {/* Loading shimmer */}
          {!isImageLoaded && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#F0EDE8] via-[#FAF8F5] to-[#F0EDE8]"
              animate={{
                backgroundPosition: ["200% 0", "-200% 0"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 100%",
              }}
            />
          )}

          <Image
            src={photo.imageUrl}
            alt={photo.caption || "Photo by Eliav"}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            sizes={
              size === 1
                ? "(max-width: 768px) 100vw, 600px"
                : size === 2
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            }
            loading={index < 6 ? "eager" : "lazy"}
            onLoad={() => setIsImageLoaded(true)}
          />

          {/* Vintage overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/10 via-transparent to-rose-50/10 pointer-events-none" />
        </div>

        {/* Comment area */}
        <div className="mt-3 min-h-[32px] flex items-center justify-center px-1">
          <p className="caption-text text-center w-full truncate">
            {photo.caption ? (
              <span className="text-[#4A4A4A]">{photo.caption}</span>
            ) : (
              <span className="text-[#B0B0B0] flex items-center justify-center gap-1">
                <span className="text-sm">💬</span> Add comment...
              </span>
            )}
          </p>
        </div>

        {/* Date */}
        <p className="text-[10px] text-[#A0A0A0] text-center mt-1 font-sans tracking-wider uppercase">
          {new Date(photo.uploadedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </motion.div>
    </motion.div>
  );
}
