"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Photo } from "@/lib/types";
import LikeAnimation, { getRandomVariant } from "./LikeAnimation";

interface PolaroidProps {
  photo: Photo;
  index: number;
  size?: 1 | 2 | 3;
  isNew?: boolean;
  onClick?: () => void;
  // Like functionality
  currentUserName?: string;
  currentUserProfilePic?: string;
  onLike?: (photo: Photo) => Promise<void>;
  isLiking?: boolean;
  // Seen tracking
  onVisible?: (photoId: string) => void;
}

export default function Polaroid({
  photo,
  index,
  size = 3,
  isNew = false,
  onClick,
  currentUserName,
  currentUserProfilePic,
  onLike,
  isLiking = false,
  onVisible,
}: PolaroidProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [animationVariant, setAnimationVariant] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const hasBeenVisible = useRef(false);

  // Check if current user has liked this photo
  const userHasLiked = currentUserName
    ? photo.likes?.some(like => like.userName === currentUserName) || false
    : false;
  const likesCount = photo.likes?.length || 0;

  // IntersectionObserver to track when photo becomes visible
  useEffect(() => {
    if (!onVisible || hasBeenVisible.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenVisible.current) {
            hasBeenVisible.current = true;
            onVisible(photo.id);
          }
        });
      },
      { threshold: 0.5 } // 50% of the photo must be visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [photo.id, onVisible]);

  // Handle like action
  const handleLike = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!onLike || isLiking || !currentUserName) return;

    // Show animation only if we're liking (not unliking)
    if (!userHasLiked) {
      setAnimationVariant(getRandomVariant());
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
    }

    await onLike(photo);
  }, [onLike, isLiking, currentUserName, userHasLiked, photo]);

  // Handle double tap to like
  const handleTap = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected - like the photo (only if not already liked)
      if (!userHasLiked && onLike && currentUserName) {
        handleLike();
      }
      lastTapRef.current = 0; // Reset to prevent triple-tap triggering
    } else {
      lastTapRef.current = now;
      // Single tap - open modal after a short delay (to check for double tap)
      setTimeout(() => {
        if (lastTapRef.current === now && onClick) {
          onClick();
        }
      }, DOUBLE_TAP_DELAY);
    }
  }, [userHasLiked, onLike, currentUserName, handleLike, onClick]);

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
      ref={containerRef}
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
      onClick={handleTap}
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

        {/* Photo/Video container */}
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

          {photo.mediaType === "video" ? (
            <>
              <video
                src={photo.imageUrl}
                className={`object-cover w-full h-full transition-opacity duration-300 ${
                  isImageLoaded ? "opacity-100" : "opacity-0"
                }`}
                muted
                playsInline
                preload="metadata"
                onLoadedData={() => setIsImageLoaded(true)}
              />
              {/* Video play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1" />
                </motion.div>
              </div>
            </>
          ) : (
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
          )}

          {/* Vintage overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/10 via-transparent to-rose-50/10 pointer-events-none" />

          {/* Like animation overlay */}
          <LikeAnimation show={showLikeAnimation} variant={animationVariant} />
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

        {/* Date and Like row */}
        <div className="flex items-center justify-between mt-1 px-1">
          <p className="text-[10px] text-[#A0A0A0] font-sans tracking-wider uppercase">
            {new Date(photo.uploadedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          {/* Like button */}
          {currentUserName && onLike && (
            <div className="flex items-center gap-1">
              <motion.button
                className={`text-base transition-colors ${
                  userHasLiked ? "text-red-500" : "text-gray-300 hover:text-red-400"
                }`}
                onClick={handleLike}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                disabled={isLiking}
              >
                <motion.span
                  animate={userHasLiked ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {userHasLiked ? "❤️" : "🤍"}
                </motion.span>
              </motion.button>
              {likesCount > 0 && (
                <span className="text-[10px] text-[#A0A0A0]">
                  {likesCount}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
