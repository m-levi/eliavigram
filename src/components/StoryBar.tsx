"use client";

import { useState, useEffect } from "react";
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
    <div className="w-full overflow-x-auto scrollbar-hide py-2 mb-6">
      <div className="flex gap-4 px-4 min-w-min">
        {isLoading ? (
          // Loading skeletons
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 animate-pulse" />
                <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </>
        ) : (
          stories.map((story, index) => {
            const firstPhoto = photos.find((p) => p.id === story.photoIds[0]);

            return (
              <motion.button
                key={story.id}
                onClick={() => onStoryClick(index)}
                className="flex flex-col items-center gap-1.5 min-w-[72px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Gradient ring */}
                <div
                  className={`p-[3px] rounded-full bg-gradient-to-tr ${story.gradient}`}
                >
                  {/* White/cream inner border */}
                  <div className="p-[2px] bg-[#FAF8F5] rounded-full">
                    {/* Photo circle */}
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-[#E8DDD4] relative">
                      {firstPhoto ? (
                        <Image
                          src={firstPhoto.imageUrl}
                          alt={story.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-[#E8B4B8] to-[#A8D8EA]">
                          {story.emoji}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Story title */}
                <span className="text-[11px] text-[#4A4A4A] font-medium truncate max-w-[72px] text-center">
                  {story.title}
                </span>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
