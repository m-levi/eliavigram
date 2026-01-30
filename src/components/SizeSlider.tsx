"use client";

import { motion } from "framer-motion";

interface SizeSliderProps {
  value: 1 | 2 | 3;
  onChange: (value: 1 | 2 | 3) => void;
}

export default function SizeSlider({ value, onChange }: SizeSliderProps) {
  const options = [
    { value: 3 as const, squares: 3 },
    { value: 2 as const, squares: 2 },
    { value: 1 as const, squares: 1 },
  ];

  return (
    <div className="flex items-center gap-1">
      {options.map((option) => (
        <motion.button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`relative p-2 rounded-lg transition-all duration-200 ${
            value === option.value
              ? "bg-[#3D5A73] shadow-md"
              : "bg-transparent hover:bg-[#F0EDE8]"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={`${option.value} per row`}
        >
          {/* Grid icon representation */}
          <div className={`grid gap-0.5 ${
            option.squares === 1 ? "grid-cols-1" :
            option.squares === 2 ? "grid-cols-2" :
            "grid-cols-3"
          }`}>
            {Array.from({ length: option.squares }).map((_, i) => (
              <motion.div
                key={i}
                className={`rounded-sm ${
                  value === option.value
                    ? "bg-white"
                    : "bg-[#A0A0A0]"
                }`}
                style={{
                  width: option.squares === 1 ? 16 : option.squares === 2 ? 10 : 6,
                  height: option.squares === 1 ? 16 : option.squares === 2 ? 10 : 6,
                }}
                initial={false}
                animate={{
                  scale: value === option.value ? 1 : 0.9,
                }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
        </motion.button>
      ))}
    </div>
  );
}
