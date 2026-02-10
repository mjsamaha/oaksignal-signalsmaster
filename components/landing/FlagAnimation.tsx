"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const flags = [
  {
    id: "alpha",
    name: "Alpha",
    description: "Diver Down",
    render: (
      <svg viewBox="0 0 600 400" className="w-full h-full shadow-inner rounded-md overflow-hidden">
        <rect x="0" y="0" width="300" height="400" fill="#ffffff" />
        <rect x="300" y="0" width="300" height="400" fill="#0057b8" />
        {/* Swallowtail cut out simulation */}
        <polygon points="600,0 450,200 600,400" fill="rgba(0,0,0,0.1)" /> 
      </svg>
    ),
  },
  {
    id: "bravo",
    name: "Bravo",
    description: "Dangerous Cargo",
    render: (
      <svg viewBox="0 0 600 400" className="w-full h-full shadow-inner rounded-md overflow-hidden">
        <rect x="0" y="0" width="600" height="400" fill="#e31d1a" />
         {/* Swallowtail cut out simulation */}
        <polygon points="600,0 450,200 600,400" fill="rgba(0,0,0,0.1)" />
      </svg>
    ),
  },
  {
    id: "charlie",
    name: "Charlie",
    description: "Affirmative",
    render: (
      <svg viewBox="0 0 600 400" className="w-full h-full shadow-inner rounded-md overflow-hidden">
        <rect x="0" y="0" width="600" height="80" fill="#0057b8" />
        <rect x="0" y="80" width="600" height="80" fill="#ffffff" />
        <rect x="0" y="160" width="600" height="80" fill="#e31d1a" />
        <rect x="0" y="240" width="600" height="80" fill="#ffffff" />
        <rect x="0" y="320" width="600" height="80" fill="#0057b8" />
      </svg>
    ),
  },
  {
    id: "delta",
    name: "Delta",
    description: "Degaussing",
    render: (
        <svg viewBox="0 0 600 400" className="w-full h-full shadow-inner rounded-md overflow-hidden">
            <rect x="0" y="0" width="600" height="133" fill="#f1c40f" />
            <rect x="0" y="133" width="600" height="134" fill="#0057b8" />
            <rect x="0" y="267" width="600" height="133" fill="#f1c40f" />
        </svg>
    )
  }
];

export function FlagAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % flags.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[3/2] max-w-[500px] mx-auto bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
      <div className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-background to-muted/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full h-full flex flex-col items-center justify-center"
          >
            <div className="w-full h-full shadow-lg rounded-lg overflow-hidden relative">
              {flags[currentIndex].render}
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute -bottom-6 left-0 right-0 text-center"
            >
              <span className="text-sm font-semibold text-muted-foreground tracking-widest uppercase">
                {flags[currentIndex].name} • {flags[currentIndex].description}
              </span>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
