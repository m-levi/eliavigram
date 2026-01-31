"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Polaroid from "./Polaroid";
import PhotoUpload from "./PhotoUpload";
import SizeSlider from "./SizeSlider";
import PhotoModal from "./PhotoModal";
import CommentsFeed from "./CommentsFeed";
import { getSeenPhotos, markPhotoAsSeen, getCurrentUser, UserProfile } from "./PasswordGate";
import { Photo } from "@/lib/types";

type TabType = "photos" | "comments";

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [gridSize, setGridSize] = useState<1 | 2 | 3>(3);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("photos");
  const [seenPhotos, setSeenPhotos] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [likingPhotoId, setLikingPhotoId] = useState<string | null>(null);

  const gridClasses = {
    1: "grid-cols-1 max-w-xl mx-auto gap-8",
    2: "grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8",
  };

  // Shuffle array helper
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchPhotos = useCallback(async () => {
    try {
      const response = await fetch("/api/photos");
      const data = await response.json();
      if (Array.isArray(data)) {
        // Get seen photos for sorting
        const seen = getSeenPhotos();
        setSeenPhotos(seen);

        // Sort photos: unseen first (shuffled), then seen (shuffled)
        const unseenPhotos = data.filter((p: Photo) => !seen.has(p.id));
        const seenPhotosList = data.filter((p: Photo) => seen.has(p.id));

        // Shuffle both groups separately, then combine
        const sortedPhotos = [
          ...shuffleArray(unseenPhotos),
          ...shuffleArray(seenPhotosList),
        ];

        setPhotos(sortedPhotos);
      } else {
        console.error("API returned non-array:", data);
        setPhotos([]);
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error);
      setPhotos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
    setCurrentUser(getCurrentUser());
  }, [fetchPhotos]);

  // Handle like action from Polaroid
  const handleLikePhoto = useCallback(async (photo: Photo) => {
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
        handlePhotoUpdate(data.photo);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setLikingPhotoId(null);
    }
  }, [currentUser, likingPhotoId]);

  // Handle photo becoming visible in viewport
  const handlePhotoVisible = useCallback((photoId: string) => {
    if (!seenPhotos.has(photoId)) {
      markPhotoAsSeen(photoId);
      setSeenPhotos(prev => new Set([...prev, photoId]));
    }
  }, [seenPhotos]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/photos/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete photo:", error);
    }
  };

  const handlePhotoUpdate = (updatedPhoto: Photo) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === updatedPhoto.id ? updatedPhoto : p))
    );
    // Also update the selected photo if it's the same
    if (selectedPhoto?.id === updatedPhoto.id) {
      setSelectedPhoto(updatedPhoto);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Vintage loading animation */}
        <motion.div
          className="relative w-20 h-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          {/* Camera shutter style */}
          <div className="absolute inset-0 rounded-full border-4 border-[#E8DDD4]" />
          <motion.div
            className="absolute inset-2 rounded-full border-4 border-t-[#4A6B8A] border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">📷</span>
          </div>
        </motion.div>
        <motion.p
          className="font-serif italic text-[#6B6B6B]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Developing photos...
        </motion.p>
      </motion.div>
    );
  }

  // Count total comments
  const totalComments = photos.reduce((acc, photo) => {
    if (photo.comments && photo.comments.length > 0) {
      return acc + photo.comments.length;
    } else if (photo.comment) {
      return acc + 1;
    }
    return acc;
  }, 0);

  // Count unseen photos
  const unseenCount = photos.filter(p => !seenPhotos.has(p.id)).length;

  return (
    <div className="container mx-auto px-4 pb-16">
      {/* Tab navigation */}
      {photos.length > 0 && (
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="inline-flex bg-[#F5F0EB] rounded-full p-1 shadow-inner">
            <motion.button
              onClick={() => setActiveTab("photos")}
              className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "photos"
                  ? "text-white"
                  : "text-[#6B6B6B] hover:text-[#4A4A4A]"
              }`}
              whileHover={{ scale: activeTab === "photos" ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeTab === "photos" && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#4A6B8A] to-[#5A7B9A] rounded-full"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                📷 Photos
              </span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab("comments")}
              className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "comments"
                  ? "text-white"
                  : "text-[#6B6B6B] hover:text-[#4A4A4A]"
              }`}
              whileHover={{ scale: activeTab === "comments" ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeTab === "comments" && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#4A6B8A] to-[#5A7B9A] rounded-full"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                💬 Comments
                {totalComments > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === "comments"
                      ? "bg-white/20"
                      : "bg-[#4A6B8A]/10 text-[#4A6B8A]"
                  }`}>
                    {totalComments}
                  </span>
                )}
              </span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Upload toggle button - only show when on photos tab and there are photos */}
      {photos.length > 0 && activeTab === "photos" && (
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={() => setShowUpload(!showUpload)}
            className="elegant-button-outline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showUpload ? "Cancel" : "Add Photos"}
          </motion.button>
        </motion.div>
      )}

      {/* Upload area */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            className="max-w-xl mx-auto mb-14"
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <PhotoUpload
              onUploadComplete={() => {
                fetchPhotos();
                setShowUpload(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state or content based on tab */}
      {photos.length === 0 ? (
        <motion.div
          className="text-center py-16 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="text-6xl mb-6"
            animate={{
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            📸
          </motion.div>
          <h2 className="font-serif text-2xl text-[#2D2D2D] mb-3">
            No photos yet
          </h2>
          <p className="text-[#6B6B6B] mb-8">
            Add Eliav&apos;s first photo to start the scrapbook!
          </p>
          <PhotoUpload
            onUploadComplete={() => {
              fetchPhotos();
            }}
          />
        </motion.div>
      ) : activeTab === "comments" ? (
        /* Comments Feed */
        <CommentsFeed
          photos={photos}
          onPhotoClick={(photo) => setSelectedPhoto(photo)}
          onPhotoUpdate={handlePhotoUpdate}
        />
      ) : (
        <>
          {/* Controls bar */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 px-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.p
              className="font-serif italic text-[#6B6B6B]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {photos.length} {photos.length === 1 ? "precious moment" : "precious moments"}
              {unseenCount > 0 && (
                <span className="ml-2 text-[#E8B4B8]">
                  ({unseenCount} new ✨)
                </span>
              )}
            </motion.p>
            {/* Hide size picker on mobile */}
            <div className="hidden sm:block">
              <SizeSlider value={gridSize} onChange={setGridSize} />
            </div>
          </motion.div>

          {/* Photo grid */}
          <motion.div
            className={`grid ${gridClasses[gridSize]} px-2 md:px-4`}
            layout
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <AnimatePresence mode="popLayout">
              {photos.map((photo, index) => (
                <Polaroid
                  key={photo.id}
                  photo={photo}
                  index={index}
                  size={gridSize}
                  isNew={!seenPhotos.has(photo.id)}
                  onClick={() => setSelectedPhoto(photo)}
                  currentUserName={currentUser?.name}
                  currentUserProfilePic={currentUser?.profilePicUrl}
                  onLike={handleLikePhoto}
                  isLiking={likingPhotoId === photo.id}
                  onVisible={handlePhotoVisible}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {/* Photo Modal */}
      <PhotoModal
        photo={selectedPhoto}
        onClose={() => {
          // Mark photo as seen when closing modal
          if (selectedPhoto && !seenPhotos.has(selectedPhoto.id)) {
            markPhotoAsSeen(selectedPhoto.id);
            setSeenPhotos(prev => new Set([...prev, selectedPhoto.id]));
          }
          setSelectedPhoto(null);
        }}
        onPhotoUpdate={handlePhotoUpdate}
        onDelete={handleDelete}
      />

      {/* Footer */}
      <motion.div
        className="text-center mt-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        <p className="font-serif italic text-sm text-[#A0A0A0] flex items-center justify-center gap-2">
          Made with
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            💕
          </motion.span>
          for a little photographer
        </p>
      </motion.div>
    </div>
  );
}
