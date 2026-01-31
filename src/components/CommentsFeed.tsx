"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Photo, Comment } from "@/lib/types";
import { getCurrentUser, UserProfile } from "./PasswordGate";

interface CommentWithPhoto {
  comment: Comment;
  photo: Photo;
}

interface CommentsFeedProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  onPhotoUpdate: (photo: Photo) => void;
}

export default function CommentsFeed({ photos, onPhotoClick, onPhotoUpdate }: CommentsFeedProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [likingPhotoId, setLikingPhotoId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  // Collect all comments from all photos and sort by date (newest first)
  const allComments: CommentWithPhoto[] = photos
    .flatMap((photo) => {
      const comments: Comment[] = [];

      // Add comments array
      if (photo.comments && photo.comments.length > 0) {
        comments.push(...photo.comments);
      }
      // Fall back to legacy single comment if no comments array
      else if (photo.comment) {
        comments.push({ ...photo.comment, id: `legacy-${photo.id}` });
      }

      return comments.map((comment) => ({ comment, photo }));
    })
    .sort((a, b) =>
      new Date(b.comment.createdAt).getTime() - new Date(a.comment.createdAt).getTime()
    );

  const handleToggleLike = async (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the photo modal
    if (!currentUser || likingPhotoId === photo.id) return;

    setLikingPhotoId(photo.id);

    try {
      const response = await fetch(`/api/photos/${photo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_like",
          userName: currentUser.name,
          userProfilePic: currentUser.profilePicUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onPhotoUpdate(data.photo);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setLikingPhotoId(null);
    }
  };

  const isPhotoLikedByUser = (photo: Photo): boolean => {
    if (!currentUser) return false;
    return photo.likes?.some(like => like.userName === currentUser.name) || false;
  };

  if (allComments.length === 0) {
    return (
      <motion.div
        className="text-center py-16 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="text-6xl mb-6"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          💬
        </motion.div>
        <h2 className="font-serif text-2xl text-[#2D2D2D] mb-3">
          No comments yet
        </h2>
        <p className="text-[#6B6B6B]">
          Click on a photo to be the first to leave a comment!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-16">
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-serif italic text-[#6B6B6B]">
            {allComments.length} {allComments.length === 1 ? "comment" : "comments"} from the community
          </p>
        </motion.div>

        {/* Comments list */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {allComments.map(({ comment, photo }, index) => {
              const liked = isPhotoLikedByUser(photo);
              const likesCount = photo.likes?.length || 0;

              return (
                <motion.div
                  key={comment.id || `${photo.id}-${index}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onPhotoClick(photo)}
                >
                  <div className="flex gap-4 p-4">
                    {/* Photo thumbnail with like overlay */}
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#F0EDE8]">
                      <Image
                        src={photo.imageUrl}
                        alt="Photo"
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                      {/* Vintage overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 via-transparent to-rose-50/20 pointer-events-none" />
                    </div>

                    {/* Comment content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        {/* Author profile pic */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8B4B8] to-[#A8D8EA] flex items-center justify-center overflow-hidden flex-shrink-0">
                          {comment.authorProfilePic ? (
                            <Image
                              src={comment.authorProfilePic}
                              alt={comment.author}
                              width={32}
                              height={32}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span className="text-xs font-medium text-white">
                              {comment.author.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Comment text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium text-[#2D2D2D]">
                              {comment.author}
                            </span>
                          </p>
                          <p className="text-[#4A4A4A] text-sm mt-1 line-clamp-2">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Like button */}
                    <div className="flex flex-col items-center justify-center gap-1">
                      <motion.button
                        className={`text-xl transition-colors ${
                          liked ? "text-red-500" : "text-gray-300 hover:text-red-400"
                        }`}
                        onClick={(e) => handleToggleLike(photo, e)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        disabled={likingPhotoId === photo.id}
                      >
                        <motion.span
                          animate={liked ? { scale: [1, 1.3, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {liked ? "❤️" : "🤍"}
                        </motion.span>
                      </motion.button>
                      {likesCount > 0 && (
                        <span className="text-xs text-[#A0A0A0]">
                          {likesCount}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
