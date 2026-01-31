"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Photo } from "@/lib/types";

interface StoriesProps {
  photos: Photo[];
  startIndex?: number;
  onClose: () => void;
  currentUserName?: string;
}

const STORY_DURATION = 5000; // 5 seconds per story

export default function Stories({
  photos,
  startIndex = 0,
  onClose,
  currentUserName,
}: StoriesProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPhoto = photos[currentIndex];

  // Go to next story
  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, photos.length, onClose]);

  // Go to previous story
  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      setProgress(0);
    }
  }, [currentIndex]);

  // Handle progress timer
  useEffect(() => {
    if (isPaused) return;

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goNext();
          return 0;
        }
        return prev + (100 / (STORY_DURATION / 50));
      });
    }, 50);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPaused, goNext, currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goNext, goPrev]);

  // Handle tap zones
  const handleTap = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const tapZone = rect.width / 3;

    if (x < tapZone) {
      goPrev();
    } else if (x > rect.width - tapZone) {
      goNext();
    }
  };

  // Handle touch for swipe down to close
  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 100) {
      onClose();
    }
    setIsPaused(false);
  };

  // Check if user has liked
  const userHasLiked = currentUserName
    ? currentPhoto.likes?.some((like) => like.userName === currentUserName)
    : false;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-3">
        {photos.map((_, index) => (
          <div
            key={index}
            className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{
                width:
                  index < currentIndex
                    ? "100%"
                    : index === currentIndex
                    ? `${progress}%`
                    : "0%",
              }}
              transition={{ duration: 0.05 }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 z-20 flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8B4B8] to-[#A8D8EA] flex items-center justify-center">
            <span className="text-sm">📷</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">Eliavigram</p>
            <p className="text-white/60 text-xs">
              {new Date(currentPhoto.uploadedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Main content area */}
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center"
        onClick={handleTap}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentPhoto.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {currentPhoto.mediaType === "video" ? (
              <video
                src={currentPhoto.imageUrl}
                className="max-h-full max-w-full object-contain"
                autoPlay
                muted
                playsInline
                loop
              />
            ) : (
              <Image
                src={currentPhoto.imageUrl}
                alt={currentPhoto.caption || "Photo"}
                fill
                className="object-contain"
                priority
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Tap zones indicators (visible on hover) */}
        <div className="absolute inset-y-0 left-0 w-1/3 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity">
          <div className="text-white/50 text-4xl">‹</div>
        </div>
        <div className="absolute inset-y-0 right-0 w-1/3 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity">
          <div className="text-white/50 text-4xl">›</div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        {/* Caption */}
        {currentPhoto.caption && (
          <p className="text-white text-sm mb-3 max-w-md">
            {currentPhoto.caption}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-white/80 text-sm">
          {/* Likes */}
          <div className="flex items-center gap-1.5">
            <span>{userHasLiked ? "❤️" : "🤍"}</span>
            <span>{currentPhoto.likes?.length || 0}</span>
          </div>

          {/* Comments */}
          {(currentPhoto.comments?.length || 0) > 0 && (
            <div className="flex items-center gap-1.5">
              <span>💬</span>
              <span>{currentPhoto.comments?.length}</span>
            </div>
          )}

          {/* Photo counter */}
          <div className="ml-auto text-white/50 text-xs">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      </div>

      {/* Pause indicator */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-black/50 rounded-full p-4">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
