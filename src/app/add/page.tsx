"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import PhotoUpload from "@/components/PhotoUpload";
import PasswordGate from "@/components/PasswordGate";

export default function AddPage() {
  const router = useRouter();

  return (
    <PasswordGate>
      <main className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FDF9F6] to-[#F5F0EB]">
        {/* Header */}
        <header className="relative py-8 px-4">
          <div className="max-w-xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#6B6B6B] hover:text-[#4A4A4A] transition-colors mb-6"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-sm font-medium">Back to Gallery</span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-serif text-3xl text-[#2D2D2D] mb-2">
                Add New Photos
              </h1>
              <p className="text-[#6B6B6B]">
                Upload photos to add to Eliav&apos;s scrapbook. AI will automatically generate captions!
              </p>
            </motion.div>
          </div>
        </header>

        {/* Upload Area */}
        <section className="px-4 pb-16">
          <motion.div
            className="max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PhotoUpload
              onUploadComplete={() => {
                router.push("/");
              }}
            />
          </motion.div>
        </section>

        {/* Tips */}
        <section className="px-4 pb-16">
          <motion.div
            className="max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-white/50 rounded-2xl p-6 border border-[#E8DDD4]">
              <h3 className="font-medium text-[#4A4A4A] mb-3 flex items-center gap-2">
                <span>💡</span> Tips
              </h3>
              <ul className="space-y-2 text-sm text-[#6B6B6B]">
                <li className="flex items-start gap-2">
                  <span className="text-[#E8B4B8]">•</span>
                  <span>You can upload multiple photos at once</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E8B4B8]">•</span>
                  <span>Videos are also supported</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E8B4B8]">•</span>
                  <span>AI will generate cute captions automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E8B4B8]">•</span>
                  <span>Duplicate photos are automatically skipped</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </section>
      </main>
    </PasswordGate>
  );
}
