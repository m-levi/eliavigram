"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Photo } from "@/lib/types";

interface PolaroidProps {
  photo: Photo;
  index: number;
  onDelete?: (id: string) => void;
  onUpdateCaption?: (id: string, caption: string) => void;
}

export default function Polaroid({ photo, index, onDelete, onUpdateCaption }: PolaroidProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(photo.caption || "");

  // Generate consistent but varied rotation based on photo id and index
  const rotation = useMemo(() => {
    const seed = photo.id.charCodeAt(0) + photo.id.charCodeAt(photo.id.length - 1) + index;
    // Rotations between -8 and 8 degrees, with more variety
    const rotations = [-8, -5, -3, -1.5, 0, 1.5, 3, 5, 8, -4, 4, -6, 6, -2, 2];
    return rotations[seed % rotations.length];
  }, [photo.id, index]);

  // Slight vertical offset for scattered look
  const offsetY = useMemo(() => {
    const seed = photo.id.charCodeAt(1) || 0;
    return (seed % 24) - 12; // -12px to +12px
  }, [photo.id]);

  const handleSaveCaption = async () => {
    if (onUpdateCaption) {
      await onUpdateCaption(photo.id, caption);
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      className="polaroid-container relative"
      initial={{ opacity: 0, y: 40, rotate: rotation * 2 }}
      whileInView={{
        opacity: 1,
        y: offsetY,
        rotate: rotation,
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{
        scale: 1.05,
        rotate: 0,
        y: offsetY - 8,
        zIndex: 10,
        transition: { duration: 0.3 }
      }}
    >
      <motion.div
        className="polaroid cursor-pointer"
        whileTap={{ scale: 0.98 }}
      >
        {/* Photo container */}
        <div className="relative w-full aspect-square overflow-hidden bg-[#F5F5F5]">
          <Image
            src={photo.imageUrl}
            alt={photo.caption || "Photo by Eliav"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Subtle warm overlay for vintage feel */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/10 via-transparent to-rose-50/10 pointer-events-none" />

          {/* Delete button - shows on hover */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this photo?")) {
                  onDelete(photo.id);
                }
              }}
              className="delete-btn absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-[#6B6B6B] hover:text-[#2D2D2D] text-sm transition-all shadow-sm"
              title="Delete photo"
            >
              ✕
            </button>
          )}
        </div>

        {/* Caption area */}
        <div className="mt-3 min-h-[32px] flex items-center justify-center px-1">
          {isEditing ? (
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="caption-input"
              placeholder="Add a caption..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveCaption();
                if (e.key === "Escape") {
                  setCaption(photo.caption || "");
                  setIsEditing(false);
                }
              }}
              onBlur={handleSaveCaption}
            />
          ) : (
            <p
              className="caption-text text-center cursor-pointer hover:text-[#2D2D2D] transition-colors w-full truncate"
              onClick={() => setIsEditing(true)}
            >
              {photo.caption || "Add caption..."}
            </p>
          )}
        </div>

        {/* Date */}
        <p className="text-[11px] text-[#A0A0A0] text-center mt-1 font-sans tracking-wide">
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
