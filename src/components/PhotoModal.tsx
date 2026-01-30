"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Photo, Comment } from "@/lib/types";
import { getCurrentUser, UserProfile } from "./PasswordGate";
import { v4 as uuidv4 } from "uuid";

interface PhotoModalProps {
  photo: Photo | null;
  onClose: () => void;
  onPhotoUpdate: (photo: Photo) => void;
  onDelete: (id: string) => void;
}

export default function PhotoModal({
  photo,
  onClose,
  onPhotoUpdate,
  onDelete,
}: PhotoModalProps) {
  const [newCommentText, setNewCommentText] = useState("");
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  useEffect(() => {
    if (photo) {
      setNewCommentText("");
      setIsImageLoaded(false);
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

  const handleAddComment = async () => {
    if (!photo || !newCommentText.trim() || !currentUser) return;

    setIsSaving(true);
    const comment: Comment = {
      id: uuidv4(),
      text: newCommentText.trim(),
      author: currentUser.name,
      authorProfilePic: currentUser.profilePicUrl,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`/api/photos/${photo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_comment", comment }),
      });

      if (response.ok) {
        const data = await response.json();
        onPhotoUpdate(data.photo);
        setNewCommentText("");
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLike = async () => {
    if (!photo || !currentUser || isLiking) return;

    setIsLiking(true);

    // Show animation if we're liking (not unliking)
    const userHasLiked = photo.likes?.some(like => like.userName === currentUser.name);
    if (!userHasLiked) {
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 800);
    }

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
      setIsLiking(false);
    }
  };

  const handleDelete = () => {
    if (photo && confirm("Delete this polaroid?")) {
      onDelete(photo.id);
      onClose();
    }
  };

  const userHasLiked = currentUser && photo?.likes?.some(like => like.userName === currentUser.name);
  const likesCount = photo?.likes?.length || 0;
  const comments = photo?.comments || (photo?.comment ? [{ ...photo.comment, id: "legacy" }] : []);

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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-auto"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Polaroid card */}
            <div className="polaroid-modal relative bg-white p-4 md:p-6 shadow-2xl rounded-sm">
              {/* Film grain overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-sm"
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
                x
              </motion.button>

              {/* Image container */}
              <div className="relative aspect-square w-full overflow-hidden bg-[#F0EDE8] rounded-sm">
                {/* Loading indicator */}
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="relative w-16 h-16"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute inset-0 rounded-full border-4 border-[#E8DDD4]" />
                      <motion.div
                        className="absolute inset-2 rounded-full border-4 border-t-[#4A6B8A] border-r-transparent border-b-transparent border-l-transparent"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl">📷</span>
                      </div>
                    </motion.div>
                  </div>
                )}

                <Image
                  src={photo.imageUrl}
                  alt={photo.comment?.text || photo.caption || "Photo by Eliav"}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    isImageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  sizes="(max-width: 768px) 100vw, 700px"
                  priority
                  onLoad={() => setIsImageLoaded(true)}
                />

                {/* Like animation overlay */}
                <AnimatePresence>
                  {showLikeAnimation && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                    >
                      <motion.span
                        className="text-8xl drop-shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.5, 1] }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        ❤️
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Vintage overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/10 via-transparent to-rose-50/10 pointer-events-none" />
              </div>

              {/* Like and comment section */}
              <div className="mt-4 md:mt-6 space-y-4">
                {/* Like button and count */}
                <div className="flex items-center gap-4">
                  <motion.button
                    className={`flex items-center gap-2 text-2xl transition-colors ${
                      userHasLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"
                    }`}
                    onClick={handleToggleLike}
                    whileHover={{ scale: 1.1 }}
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
                    <span className="text-sm text-[#6B6B6B]">
                      {likesCount} {likesCount === 1 ? "like" : "likes"}
                    </span>
                  )}
                </div>

                {/* Date */}
                <p className="text-xs text-[#A0A0A0] tracking-wide uppercase">
                  {new Date(photo.uploadedAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                {/* Comments section */}
                <div className="space-y-3">
                  {comments.length > 0 ? (
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {comments.map((comment, index) => (
                        <motion.div
                          key={comment.id || index}
                          className="flex gap-3 items-start"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {/* Profile pic */}
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
                          {/* Comment content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-medium text-[#2D2D2D]">{comment.author}</span>
                              <span className="text-[#4A4A4A] ml-2">{comment.text}</span>
                            </p>
                            <p className="text-xs text-[#A0A0A0] mt-1">
                              {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-serif italic text-[#A0A0A0] text-sm">
                      No comments yet. Be the first! 💬
                    </p>
                  )}

                  {/* Add comment form */}
                  {currentUser && (
                    <div className="flex gap-3 items-center pt-3 border-t border-[#F0F0F0]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8B4B8] to-[#A8D8EA] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {currentUser.profilePicUrl ? (
                          <Image
                            src={currentUser.profilePicUrl}
                            alt={currentUser.name}
                            width={32}
                            height={32}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-xs font-medium text-white">
                            {currentUser.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment();
                          }
                        }}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 text-sm border border-[#E0E0E0] rounded-full text-[#4A4A4A] focus:outline-none focus:border-[#4A6B8A] transition-colors"
                        disabled={isSaving}
                      />
                      <motion.button
                        onClick={handleAddComment}
                        disabled={!newCommentText.trim() || isSaving}
                        className="text-sm font-medium text-[#4A6B8A] disabled:text-[#C0C0C0] disabled:cursor-not-allowed"
                        whileHover={{ scale: newCommentText.trim() ? 1.05 : 1 }}
                        whileTap={{ scale: newCommentText.trim() ? 0.95 : 1 }}
                      >
                        {isSaving ? "..." : "Post"}
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-3 border-t border-[#F0F0F0]">
                  <motion.button
                    className="text-sm text-[#E57373] hover:text-[#D32F2F] flex items-center gap-1"
                    onClick={handleDelete}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>🗑️</span> Delete
                  </motion.button>
                  <p className="text-xs text-[#C4B5A4] font-serif italic">
                    Click outside to close
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
