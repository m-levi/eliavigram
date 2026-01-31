"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Photo } from "@/lib/types";
import { StoryTheme } from "@/lib/ai";

interface StoryBarProps {
  photos: Photo[];
  onStoryClick: (storyIndex: number) => void;
}

export default function StoryBar({ photos, onStoryClick }: StoryBarProps) {
  const [stories, setStories] = useState<StoryTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (photos.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch("/api/stories")
      .then((res) => res.json())
      .then((data) => {
        if (data.stories && data.stories.length > 0) {
          setStories(data.stories);
        } else {
          setStories([
            {
              id: "all",
              title: "All Moments",
              subtitle: "Your photos",
              emoji: "📷",
              photoIds: photos.map((p) => p.id),
              gradient: "from-pink-400 to-purple-500",
            },
          ]);
        }
      })
      .catch(() => {
        setStories([
          {
            id: "all",
            title: "All Moments",
            subtitle: "Your photos",
            emoji: "📷",
            photoIds: photos.map((p) => p.id),
            gradient: "from-pink-400 to-purple-500",
          },
        ]);
      })
      .finally(() => setIsLoading(false));
  }, [photos]);

  if (photos.length === 0) return null;

  return (
    <div className="w-full mb-6">
      {/* Section header for mobile */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-sm font-semibold text-[#4A4A4A] flex items-center gap-2">
          <span className="text-base">✨</span> Stories
        </h2>
        <span className="text-xs text-[#A0A0A0]">
          {stories.length > 0 ? `${stories.length} collections` : ""}
        </span>
      </div>

      {/* Scrollable story bar */}
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto scrollbar-hide py-2 px-2"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex gap-3 sm:gap-4 px-2 min-w-min">
          {isLoading ? (
            // Loading skeletons - mobile optimized
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <motion.div
                    className="w-[72px] h-[72px] sm:w-[76px] sm:h-[76px] rounded-full bg-gradient-to-tr from-gray-200 to-gray-300"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  />
                  <div className="w-14 h-3 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </>
          ) : (
            stories.map((story, index) => {
              const firstPhoto = photos.find((p) => p.id === story.photoIds[0]);
              const photoCount = story.photoIds.length;

              return (
                <motion.button
                  key={story.id}
                  onClick={() => onStoryClick(index)}
                  className="flex flex-col items-center gap-2 min-w-[80px] sm:min-w-[84px] touch-target"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, type: "spring", stiffness: 300 }}
                >
                  {/* Gradient ring with pulse animation */}
                  <motion.div
                    className={`p-[3px] rounded-full bg-gradient-to-tr ${story.gradient} story-ring-pulse relative`}
                    whileHover={{
                      boxShadow: "0 0 20px rgba(232, 180, 184, 0.5)",
                    }}
                  >
                    {/* Photo count badge */}
                    <div className="absolute -top-1 -right-1 z-10 bg-white rounded-full px-1.5 py-0.5 shadow-sm">
                      <span className="text-[10px] font-bold text-[#4A6B8A]">{photoCount}</span>
                    </div>

                    {/* White/cream inner border */}
                    <div className="p-[2px] bg-[#FAF8F5] rounded-full">
                      {/* Photo circle - larger on mobile for easier tap */}
                      <div className="w-[66px] h-[66px] sm:w-[68px] sm:h-[68px] rounded-full overflow-hidden bg-[#E8DDD4] relative">
                        {firstPhoto ? (
                          <Image
                            src={firstPhoto.imageUrl}
                            alt={story.title}
                            fill
                            className="object-cover"
                            sizes="72px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl bg-gradient-to-br from-[#E8B4B8] to-[#A8D8EA]">
                            {story.emoji}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Story title with emoji */}
                  <div className="text-center">
                    <span className="text-[11px] sm:text-xs text-[#4A4A4A] font-medium truncate max-w-[80px] block">
                      {story.emoji} {story.title}
                    </span>
                  </div>
                </motion.button>
              );
            })
          )}

          {/* "See All" button at the end */}
          {!isLoading && stories.length > 0 && (
            <motion.button
              onClick={() => onStoryClick(0)}
              className="flex flex-col items-center gap-2 min-w-[80px] opacity-60 hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: stories.length * 0.08 }}
            >
              <div className="w-[66px] h-[66px] sm:w-[68px] sm:h-[68px] rounded-full border-2 border-dashed border-[#E8DDD4] flex items-center justify-center bg-white/50">
                <svg
                  className="w-6 h-6 text-[#A0A0A0]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </div>
              <span className="text-[11px] text-[#A0A0A0] font-medium">See All</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Subtle scroll indicator for mobile */}
      <div className="flex justify-center gap-1 mt-2 md:hidden">
        {stories.slice(0, 4).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-[#4A6B8A]" : "bg-[#E8DDD4]"}`}
          />
        ))}
      </div>
    </div>
  );
}
