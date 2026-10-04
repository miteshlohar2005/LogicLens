"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGenerationStore } from "@/store/generationStore";

export default function ScannerAnimation() {
  const status = useGenerationStore((s) => s.status);
  const isScanning = status === "parsing";

  return (
    <AnimatePresence>
      {isScanning && (
        <motion.div
          key="scanner"
          className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Dark overlay with a horizontal slit of clarity */}
          <div className="absolute inset-0 bg-[rgba(8,11,20,0.45)]" />

          {/* Sweeping scan bar */}
          <motion.div
            className="absolute top-0 bottom-0 w-1"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(108,99,255,0.8) 40%, rgba(0,212,255,0.9) 50%, rgba(108,99,255,0.8) 60%, transparent 100%)",
              filter: "blur(2px)",
              boxShadow: "0 0 24px 8px rgba(108,99,255,0.5)",
            }}
            initial={{ left: "-4px", opacity: 0 }}
            animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.2, ease: "easeInOut", times: [0, 0.05, 0.95, 1] }}
          />

          {/* Horizontal scan lines */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-0 right-0 h-px"
              style={{
                top: `${12 + i * 11}%`,
                background: "linear-gradient(90deg, transparent, rgba(108,99,255,0.15), rgba(0,212,255,0.1), transparent)",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1], opacity: [0, 0.6, 0] }}
              transition={{ duration: 2.2, delay: i * 0.04, ease: "easeOut" }}
            />
          ))}

          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card px-5 py-3 border border-[rgba(108,99,255,0.4)] flex items-center gap-3"
            >
              <motion.div
                className="w-4 h-4 rounded-full border-2 border-[rgba(108,99,255,0.4)] border-t-[#6c63ff]"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-[#a78bfa] text-sm font-medium tracking-wide">
                Parsing Semantic Logic…
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
