"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Photo } from "@/lib/types";

interface PhotoModalProps {
  photo: Photo | null;
  onClose: () => void;
  onUpdateCaption: (id: string, caption: string) => void;
  onDelete: (id: string) => void;
}

export default function PhotoModal({
  photo,
  onClose,
  onUpdateCaption,
  onDelete,
}: PhotoModalProps) {
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (photo) {
      setComment(photo.caption || "");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [photo]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSaveComment = async () => {
    if (photo) {
      await onUpdateCaption(photo.id, comment);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (photo && confirm("Delete this polaroid?")) {
      onDelete(photo.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            className="relative z-10 w-full max-w-3xl"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Polaroid card */}
            <div className="polaroid-modal relative bg-white p-4 md:p-6 shadow-2xl">
              {/* Film grain overlay */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none rounded-sm"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Close button */}
              <motion.button
                className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-[#6B6B6B] hover:text-[#2D2D2D] z-20"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>

              {/* Image container */}
              <div className="relative aspect-square w-full overflow-hidden bg-[#F5F5F5] rounded-sm">
                <Image
                  src={photo.imageUrl}
                  alt={photo.caption || "Photo by Eliav"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />

                {/* Vintage overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/15 via-transparent to-rose-50/15 pointer-events-none" />
              </div>

              {/* Comment section */}
              <div className="mt-4 md:mt-6 space-y-4">
                {/* Date */}
                <p className="text-xs text-[#A0A0A0] tracking-wide">
                  {new Date(photo.uploadedAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                {/* Comment area */}
                <div className="min-h-[60px]">
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-3 border border-[#E0E0E0] rounded-lg font-serif italic text-[#4A4A4A] resize-none focus:outline-none focus:border-[#C4B5A4] transition-colors"
                        placeholder="Add a comment..."
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <motion.button
                          className="px-4 py-2 text-sm text-[#6B6B6B] hover:text-[#2D2D2D]"
                          onClick={() => {
                            setComment(photo.caption || "");
                            setIsEditing(false);
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          className="px-4 py-2 text-sm bg-[#2D2D2D] text-white rounded-lg"
                          onClick={handleSaveComment}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Save
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      className="cursor-pointer group"
                      onClick={() => setIsEditing(true)}
                      whileHover={{ scale: 1.01 }}
                    >
                      {photo.caption ? (
                        <p className="font-serif italic text-lg text-[#4A4A4A] group-hover:text-[#2D2D2D] transition-colors">
                          &ldquo;{photo.caption}&rdquo;
                        </p>
                      ) : (
                        <p className="font-serif italic text-[#A0A0A0] group-hover:text-[#6B6B6B] transition-colors flex items-center gap-2">
                          <span>💬</span> Add a comment...
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-2 border-t border-[#F0F0F0]">
                  <motion.button
                    className="text-sm text-[#E57373] hover:text-[#D32F2F] flex items-center gap-1"
                    onClick={handleDelete}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>🗑️</span> Delete
                  </motion.button>
                  <p className="text-xs text-[#C4B5A4] font-serif italic">
                    tap photo to close
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
