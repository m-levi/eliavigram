"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Polaroid from "./Polaroid";
import PhotoUpload from "./PhotoUpload";
import { Photo } from "@/lib/types";

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const fetchPhotos = useCallback(async () => {
    try {
      const response = await fetch("/api/photos");
      const data = await response.json();
      if (Array.isArray(data)) {
        setPhotos(data);
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
  }, [fetchPhotos]);

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

  const handleUpdateCaption = async (id: string, caption: string) => {
    try {
      const response = await fetch(`/api/photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption }),
      });
      if (response.ok) {
        setPhotos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, caption } : p))
        );
      }
    } catch (error) {
      console.error("Failed to update caption:", error);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-24 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          className="font-serif italic text-[#6B6B6B]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading photos...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-16">
      {/* Upload toggle button - only show when there are photos */}
      {photos.length > 0 && (
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

      {/* Empty state or photo gallery */}
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
      ) : (
        <>
          <motion.p
            className="text-center font-serif italic text-[#6B6B6B] mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {photos.length} {photos.length === 1 ? "precious moment" : "precious moments"} ✨
          </motion.p>
          <div className="photo-grid">
            {photos.map((photo, index) => (
              <Polaroid
                key={photo.id}
                photo={photo}
                index={index}
                onDelete={handleDelete}
                onUpdateCaption={handleUpdateCaption}
              />
            ))}
          </div>
        </>
      )}

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
