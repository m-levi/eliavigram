"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Photo } from "@/lib/types";
import { StoryTheme } from "@/lib/ai";

interface StoriesProps {
  photos: Photo[];
  startIndex?: number;
  onClose: () => void;
  currentUserName?: string;
  initialStoryIndex?: number;
}

const STORY_DURATION = 5000; // 5 seconds per story

// Quick reaction emojis
const QUICK_REACTIONS = ["❤️", "🔥", "😍", "😂", "😮", "👏"];

// Story ring component for the selection screen
function StoryRing({
  story,
  photos,
  onClick,
  isActive,
  index,
}: {
  story: StoryTheme;
  photos: Photo[];
  onClick: () => void;
  isActive: boolean;
  index: number;
}) {
  const firstPhoto = photos.find((p) => p.id === story.photoIds[0]);

  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-3 min-w-[90px] sm:min-w-[100px]"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
    >
      <motion.div
        className={`p-[3px] rounded-full bg-gradient-to-tr ${story.gradient}`}
        animate={
          isActive
            ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0 0 rgba(255,255,255,0.3)", "0 0 20px 5px rgba(255,255,255,0.3)", "0 0 0 0 rgba(255,255,255,0.3)"] }
            : {}
        }
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="p-[3px] bg-black rounded-full">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-800 relative">
            {firstPhoto ? (
              <Image
                src={firstPhoto.imageUrl}
                alt={story.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-gray-700 to-gray-800">
                {story.emoji}
              </div>
            )}
          </div>
        </div>
      </motion.div>
      <div className="text-center">
        <p className="text-white text-sm font-semibold truncate max-w-[90px]">
          {story.emoji} {story.title}
        </p>
        <p className="text-white/50 text-xs mt-0.5">{story.photoIds.length} photos</p>
      </div>
    </motion.button>
  );
}

// Story thumbnail preview for bottom navigation
function StoryThumbnail({
  story,
  photos,
  isActive,
  onClick,
}: {
  story: StoryTheme;
  photos: Photo[];
  isActive: boolean;
  onClick: () => void;
}) {
  const firstPhoto = photos.find((p) => p.id === story.photoIds[0]);

  return (
    <motion.button
      onClick={onClick}
      className="relative"
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all ${
          isActive
            ? "border-white shadow-lg shadow-white/30"
            : "border-white/20 opacity-60"
        }`}
        animate={isActive ? { scale: 1.1 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {firstPhoto ? (
          <Image
            src={firstPhoto.imageUrl}
            alt={story.title}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg bg-gradient-to-br from-gray-700 to-gray-800">
            {story.emoji}
          </div>
        )}
      </motion.div>
      {isActive && (
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
          layoutId="activeStoryIndicator"
        />
      )}
    </motion.button>
  );
}

export default function Stories({
  photos,
  onClose,
  currentUserName,
  initialStoryIndex,
}: StoriesProps) {
  const [stories, setStories] = useState<StoryTheme[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(
    initialStoryIndex !== undefined ? initialStoryIndex : null
  );
  const [pendingStoryIndex, setPendingStoryIndex] = useState<number | undefined>(initialStoryIndex);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [sentReaction, setSentReaction] = useState<string | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Gesture handling
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const rotateY = useTransform(dragX, [-200, 0, 200], [15, 0, -15]);
  const scale = useTransform(dragX, [-200, 0, 200], [0.95, 1, 0.95]);
  const opacity = useTransform(dragY, [0, 150], [1, 0]);

  // Get current story and its photos
  const currentStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;
  const storyPhotos = currentStory
    ? currentStory.photoIds
        .map((id) => photos.find((p) => p.id === id))
        .filter((p): p is Photo => p !== undefined)
    : [];
  const currentPhoto = storyPhotos[currentPhotoIndex];

  // Load AI-generated stories
  useEffect(() => {
    setIsLoadingStories(true);
    fetch("/api/stories")
      .then((res) => res.json())
      .then((data) => {
        if (data.stories && data.stories.length > 0) {
          setStories(data.stories);
        } else {
          // Fallback: create a single story with all photos
          setStories([
            {
              id: "all",
              title: "All Moments",
              subtitle: "Your photo collection",
              emoji: "📷",
              photoIds: photos.map((p) => p.id),
              gradient: "from-pink-400 to-purple-500",
            },
          ]);
        }
      })
      .catch((error) => {
        console.error("Failed to load stories:", error);
        // Fallback
        setStories([
          {
            id: "all",
            title: "All Moments",
            subtitle: "Your photo collection",
            emoji: "📷",
            photoIds: photos.map((p) => p.id),
            gradient: "from-pink-400 to-purple-500",
          },
        ]);
      })
      .finally(() => setIsLoadingStories(false));
  }, [photos]);

  // Auto-start story when clicked from StoryBar
  useEffect(() => {
    if (!isLoadingStories && stories.length > 0 && pendingStoryIndex !== undefined) {
      const validIndex = Math.min(pendingStoryIndex, stories.length - 1);
      setActiveStoryIndex(validIndex);
      setPendingStoryIndex(undefined);
    }
  }, [isLoadingStories, stories.length, pendingStoryIndex]);

  // Go to next photo/story
  const goNext = useCallback(() => {
    if (currentPhotoIndex < storyPhotos.length - 1) {
      // Next photo in current story
      setDirection(1);
      setCurrentPhotoIndex((prev) => prev + 1);
      setProgress(0);
      setIsImageLoaded(false);
    } else if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
      // Next story
      setDirection(1);
      setActiveStoryIndex((prev) => (prev !== null ? prev + 1 : 0));
      setCurrentPhotoIndex(0);
      setProgress(0);
      setIsImageLoaded(false);
    } else {
      // End of all stories - go back to selection
      setActiveStoryIndex(null);
      setCurrentPhotoIndex(0);
      setProgress(0);
    }
  }, [currentPhotoIndex, storyPhotos.length, activeStoryIndex, stories.length]);

  // Go to previous photo/story
  const goPrev = useCallback(() => {
    if (currentPhotoIndex > 0) {
      // Previous photo in current story
      setDirection(-1);
      setCurrentPhotoIndex((prev) => prev - 1);
      setProgress(0);
      setIsImageLoaded(false);
    } else if (activeStoryIndex !== null && activeStoryIndex > 0) {
      // Previous story (go to last photo)
      const prevStory = stories[activeStoryIndex - 1];
      const prevStoryPhotos = prevStory.photoIds.filter((id) =>
        photos.some((p) => p.id === id)
      );
      setDirection(-1);
      setActiveStoryIndex((prev) => (prev !== null ? prev - 1 : 0));
      setCurrentPhotoIndex(prevStoryPhotos.length - 1);
      setProgress(0);
      setIsImageLoaded(false);
    } else {
      // At beginning - restart current photo
      setProgress(0);
    }
  }, [currentPhotoIndex, activeStoryIndex, stories, photos]);

  // Handle progress timer (only when viewing a story)
  useEffect(() => {
    if (activeStoryIndex === null || isPaused || !isImageLoaded) return;

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goNext();
          return 0;
        }
        return prev + 100 / (STORY_DURATION / 50);
      });
    }, 50);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPaused, goNext, currentPhotoIndex, activeStoryIndex, isImageLoaded]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeStoryIndex !== null) {
          setActiveStoryIndex(null);
        } else {
          onClose();
        }
      }
      if (activeStoryIndex !== null) {
        if (e.key === "ArrowRight" || e.key === " ") goNext();
        if (e.key === "ArrowLeft") goPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goNext, goPrev, activeStoryIndex]);

  // Handle tap zones
  const handleTap = (e: React.MouseEvent) => {
    if (activeStoryIndex === null) return;

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

  // Handle swipe gestures
  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (activeStoryIndex === null) {
      // On selection screen, swipe down to close
      if (info.offset.y > 100 && info.velocity.y > 0) {
        onClose();
      }
    } else {
      // In story view
      if (info.offset.y > 100 && info.velocity.y > 0) {
        // Swipe down - go back to selection
        setActiveStoryIndex(null);
        setCurrentPhotoIndex(0);
        setProgress(0);
      } else if (Math.abs(info.offset.x) > 50) {
        // Horizontal swipe - switch stories (not just photos)
        if (info.offset.x < -50 && info.velocity.x < 0) {
          // Swipe left - next story
          if (activeStoryIndex < stories.length - 1) {
            setDirection(1);
            setActiveStoryIndex((prev) => (prev !== null ? prev + 1 : 0));
            setCurrentPhotoIndex(0);
            setProgress(0);
            setIsImageLoaded(false);
          } else {
            setActiveStoryIndex(null);
          }
        } else if (info.offset.x > 50 && info.velocity.x > 0) {
          // Swipe right - previous story
          if (activeStoryIndex > 0) {
            setDirection(-1);
            setActiveStoryIndex((prev) => (prev !== null ? prev - 1 : 0));
            setCurrentPhotoIndex(0);
            setProgress(0);
            setIsImageLoaded(false);
          }
        }
      }
    }
    setIsPaused(false);
    dragX.set(0);
    dragY.set(0);
  };

  // Send reaction
  const handleReaction = (emoji: string) => {
    setSentReaction(emoji);
    setShowReactions(false);
    setTimeout(() => setSentReaction(null), 2000);
  };

  // Check if user has liked current photo
  const userHasLiked = currentUserName
    ? currentPhoto?.likes?.some((like) => like.userName === currentUserName)
    : false;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0.5,
      scale: 0.9,
      rotateY: direction > 0 ? -15 : 15,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "50%" : "-50%",
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 15 : -15,
    }),
  };

  // Story selection screen
  if (activeStoryIndex === null) {
    return (
      <motion.div
        className="fixed inset-0 z-50 bg-gradient-to-b from-black via-gray-900 to-black flex flex-col story-viewer-mobile"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ opacity }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between p-4 pt-safe safe-area-top"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-white text-xl font-semibold flex items-center gap-2">
            <span className="text-2xl">✨</span> Stories
          </h1>
          <motion.button
            onClick={onClose}
            className="text-white p-3 hover:bg-white/10 rounded-full transition-colors touch-target"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
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
          </motion.button>
        </motion.div>

        {/* Story rings */}
        <div className="flex-1 flex flex-col justify-center px-4">
          {isLoadingStories ? (
            <motion.div
              className="flex flex-col items-center justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="text-5xl"
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.div>
              <p className="text-white/60 text-center">Creating your stories...</p>
              <div className="flex gap-2 mt-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-white/40 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              <motion.p
                className="text-white/60 text-sm mb-8 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Tap a story to start watching
              </motion.p>
              <div className="flex gap-5 sm:gap-6 overflow-x-auto scrollbar-hide pb-6 px-4 justify-center flex-wrap">
                {stories.map((story, index) => (
                  <StoryRing
                    key={story.id}
                    story={story}
                    photos={photos}
                    onClick={() => {
                      setActiveStoryIndex(index);
                      setCurrentPhotoIndex(0);
                      setProgress(0);
                      setIsImageLoaded(false);
                    }}
                    isActive={false}
                    index={index}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bottom hint */}
        <motion.div
          className="p-6 pb-safe safe-area-bottom flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="w-10 h-1 bg-white/20 rounded-full"
            animate={{ scaleX: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <p className="text-white/40 text-xs">Swipe down to close</p>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full">
            <span className="text-sm">✨</span>
            <span className="text-white/50 text-xs">AI-curated stories</span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Full-screen story viewer
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black story-viewer-mobile"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Progress bars for current story */}
      <div className="absolute top-0 left-0 right-0 z-30 flex gap-1.5 p-3 pt-safe safe-area-top">
        {storyPhotos.map((_, index) => (
          <div
            key={index}
            className="h-[3px] flex-1 bg-white/20 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-white rounded-full story-progress-glow"
              initial={{ width: 0 }}
              animate={{
                width:
                  index < currentPhotoIndex
                    ? "100%"
                    : index === currentPhotoIndex
                    ? `${progress}%`
                    : "0%",
              }}
              transition={{ duration: 0.05, ease: "linear" }}
            />
          </div>
        ))}
      </div>

      {/* Header with story info */}
      <motion.div
        className="absolute top-10 left-0 right-0 z-30 flex items-center justify-between px-4 py-2 safe-area-top"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          {/* Story thumbnail */}
          <motion.div
            className={`p-[2px] rounded-full bg-gradient-to-tr ${currentStory?.gradient || "from-pink-400 to-purple-500"}`}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-11 h-11 rounded-full overflow-hidden bg-black relative border border-black">
              {storyPhotos[0] && (
                <Image
                  src={storyPhotos[0].imageUrl}
                  alt={currentStory?.title || "Story"}
                  fill
                  className="object-cover"
                  sizes="44px"
                />
              )}
            </div>
          </motion.div>
          <div>
            <p className="text-white text-sm font-semibold flex items-center gap-2">
              {currentStory?.emoji} {currentStory?.title}
            </p>
            <p className="text-white/60 text-xs">
              {currentPhoto
                ? new Date(currentPhoto.uploadedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : ""}
            </p>
          </div>
        </div>

        {/* Close button */}
        <motion.button
          onClick={() => {
            setActiveStoryIndex(null);
            setCurrentPhotoIndex(0);
            setProgress(0);
          }}
          className="text-white p-3 hover:bg-white/10 rounded-full transition-colors touch-target"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
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
        </motion.button>
      </motion.div>

      {/* Main photo area - FULL SCREEN */}
      <motion.div
        ref={containerRef}
        className="absolute inset-0"
        onClick={handleTap}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        drag
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsPaused(true)}
        onDragEnd={handleDragEnd}
        style={{ x: dragX, y: dragY, rotateY, scale }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          {currentPhoto && (
            <motion.div
              key={`${activeStoryIndex}-${currentPhoto.id}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.4,
                ease: [0.32, 0.72, 0, 1],
                opacity: { duration: 0.25 },
              }}
              className="absolute inset-0"
              style={{ perspective: 1000 }}
            >
              {/* Loading indicator */}
              {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
                  <motion.div
                    className="flex flex-col items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                </div>
              )}

              {currentPhoto.mediaType === "video" ? (
                <video
                  src={currentPhoto.imageUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  loop
                  onLoadedData={() => setIsImageLoaded(true)}
                />
              ) : (
                <Image
                  src={currentPhoto.imageUrl}
                  alt={currentPhoto.caption || "Photo"}
                  fill
                  className={`object-cover transition-opacity duration-500 ${
                    isImageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  priority
                  sizes="100vw"
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => setIsImageLoaded(true)}
                />
              )}

              {/* Gradient overlays for readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sent reaction animation */}
      <AnimatePresence>
        {sentReaction && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 2, y: -100 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-8xl">{sentReaction}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 z-30 safe-area-bottom">
        {/* Caption */}
        {currentPhoto?.caption && (
          <motion.div
            className="px-4 mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={currentPhoto.id}
          >
            <p className="text-white text-lg font-medium drop-shadow-lg max-w-md">
              {currentPhoto.caption}
            </p>
          </motion.div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 px-4 mb-4 text-white/90">
          {/* Likes */}
          <motion.div
            className="flex items-center gap-2"
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-2xl">{userHasLiked ? "❤️" : "🤍"}</span>
            <span className="font-medium">{currentPhoto?.likes?.length || 0}</span>
          </motion.div>

          {/* Comments */}
          {(currentPhoto?.comments?.length || 0) > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">💬</span>
              <span className="font-medium">{currentPhoto?.comments?.length}</span>
            </div>
          )}

          {/* Photo counter */}
          <div className="ml-auto flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-sm text-white/80">
              {currentPhotoIndex + 1} / {storyPhotos.length}
            </span>
          </div>
        </div>

        {/* Quick reactions bar */}
        <motion.div
          className="px-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-3">
            <div className="flex-1 flex items-center gap-3">
              {QUICK_REACTIONS.map((emoji, i) => (
                <motion.button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-2xl"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
            <div className="w-px h-6 bg-white/20" />
            <motion.button
              className="p-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        {/* Story thumbnails navigation */}
        <motion.div
          className="flex justify-center gap-3 px-4 pb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {stories.map((story, index) => (
            <StoryThumbnail
              key={story.id}
              story={story}
              photos={photos}
              isActive={index === activeStoryIndex}
              onClick={() => {
                if (index !== activeStoryIndex) {
                  setDirection(index > (activeStoryIndex || 0) ? 1 : -1);
                  setActiveStoryIndex(index);
                  setCurrentPhotoIndex(0);
                  setProgress(0);
                  setIsImageLoaded(false);
                }
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Pause indicator */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-black/60 backdrop-blur-md rounded-full p-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation hints on first view */}
      <div className="absolute inset-y-0 left-0 w-1/4 flex items-center justify-start pl-4 opacity-0 active:opacity-100 transition-opacity pointer-events-none">
        <motion.div className="text-white/40 text-6xl">‹</motion.div>
      </div>
      <div className="absolute inset-y-0 right-0 w-1/4 flex items-center justify-end pr-4 opacity-0 active:opacity-100 transition-opacity pointer-events-none">
        <motion.div className="text-white/40 text-6xl">›</motion.div>
      </div>
    </motion.div>
  );
}
