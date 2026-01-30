"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface PhotoUploadProps {
  onUploadComplete: () => void;
}

export default function PhotoUpload({ onUploadComplete }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFiles = async (files: FileList) => {
    setIsUploading(true);
    const totalFiles = files.length;
    let uploadedCount = 0;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        continue;
      }

      setUploadProgress(`Uploading photo ${uploadedCount + 1} of ${totalFiles}...`);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to upload:", file.name, errorData);
        } else {
          uploadedCount++;
        }
      } catch (error) {
        console.error("Upload error:", error);
      }
    }

    setIsUploading(false);
    setUploadProgress("");
    onUploadComplete();
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        uploadFiles(files);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
  };

  return (
    <motion.div
      className={`drop-zone cursor-pointer ${isDragging ? "active" : ""} ${isUploading ? "pointer-events-none" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      whileHover={{ scale: 1.02, borderColor: "#2D2D2D" }}
      whileTap={{ scale: 0.98 }}
      animate={isDragging ? { scale: 1.05, borderColor: "#2D2D2D" } : {}}
      transition={{ duration: 0.2 }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="font-serif italic text-[#6B6B6B]"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {uploadProgress}
          </motion.p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-4">
          <motion.div
            className="text-4xl"
            animate={isDragging ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            📷
          </motion.div>
          <div className="space-y-1 text-center">
            <p className="font-serif text-lg text-[#2D2D2D]">
              {isDragging ? "Drop it like it's hot! 🔥" : "Drop photos here"}
            </p>
            <p className="text-sm text-[#A0A0A0]">
              or click to browse
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
