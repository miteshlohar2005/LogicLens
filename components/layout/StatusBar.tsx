"use client";

import { useGenerationStore } from "@/store/generationStore";
import { motion, AnimatePresence } from "framer-motion";

const MODEL_LABELS: Record<string, string> = {
  parsing: "GEMINI 2.5 FLASH",
  generating: "GEMINI 2.5 FLASH",
  refining: "GEMINI 2.5 FLASH",
};

export default function StatusBar() {
  const status = useGenerationStore((s) => s.status);
  const activeKeyIndex = useGenerationStore((s) => s.activeKeyIndex);
  const lastLatencyMs = useGenerationStore((s) => s.lastLatencyMs);
  const logicGraph = useGenerationStore((s) => s.logicGraph);
  const errorMessage = useGenerationStore((s) => s.errorMessage);
  const userApiKey = useGenerationStore((s) => s.userApiKey);

  const activeModel = MODEL_LABELS[status] ?? null;
  const isActive = ["parsing", "generating", "refining"].includes(status);
  const isError = status === "error";

  let displayError = errorMessage ?? "An error occurred";
  const lowerError = displayError.toLowerCase();

  if (
    displayError.includes("503") ||
    lowerError.includes("high demand") ||
    lowerError.includes("overloaded")
  ) {
    displayError = "Gemini Model is experiencing high demand, please try again later.";
  } else if (
    lowerError.includes("exceeded your current quota") ||
    lowerError.includes("check your plan and billing details") ||
    lowerError.includes("429")
  ) {
    displayError = "Server rate limit reached. Click 'KEY' in the top bar to use your own API key.";
  }

  return (
    <footer
      id="statusbar"
      className="bg-white border-t-[3px] border-black h-8 flex items-center px-4 gap-4 text-xs font-bold text-black uppercase tracking-wide overflow-hidden"
    >
      {/* ── Left: Status ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <AnimatePresence mode="wait">
          {isError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-white bg-[#EF476F] px-2 py-0.5 border border-black"
              title={errorMessage ?? ""} // Show the raw error message on hover just in case
            >
              <div className="w-2 h-2 bg-black" />
              <span>{displayError}</span>
            </motion.div>
          ) : isActive ? (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-black bg-[#FFD166] px-2 py-0.5 border border-black"
            >
              <div className="w-2 h-2 bg-black animate-pulse" />
              <span>{status}…</span>
            </motion.div>
          ) : status === "done" ? (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-black bg-[#06D6A0] px-2 py-0.5 border border-black"
            >
              <div className="w-2 h-2 bg-black" />
              <span>READY</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-black"
            >
              <div className="w-2 h-2 bg-black" />
              <span>IDLE</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-[3px] h-full bg-black flex-shrink-0" />

      {/* ── Center: Active model ── */}
      <AnimatePresence mode="wait">
        {activeModel && (
          <motion.div
            key={activeModel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-black bg-[#118AB2] px-2 py-0.5 text-white border border-black"
          >
            <span>{activeModel}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {activeModel && (
        <div className="w-[3px] h-full bg-black flex-shrink-0" />
      )}

      {/* ── API Key indicator ── */}
      <div
        className="flex items-center gap-2 flex-shrink-0"
        title={userApiKey ? "Using custom user API key" : activeKeyIndex === 2 ? "Using fallback API key" : "Using primary API key"}
      >
        <span>{userApiKey ? "USER KEY" : `KEY ${activeKeyIndex}`}</span>
        {!userApiKey && activeKeyIndex === 2 && (
          <span className="badge badge-warning">
            FALLBACK
          </span>
        )}
      </div>

      {/* ── Latency ── */}
      {lastLatencyMs !== null && (
        <>
          <div className="w-[3px] h-full bg-black flex-shrink-0" />
          <span className="flex-shrink-0">{lastLatencyMs}ms</span>
        </>
      )}

      {/* ── Right: Global intent (spacer + info) ── */}
      {logicGraph?.globalIntent && (
        <div className="ml-auto flex items-center gap-2 max-w-xs truncate">
          <div className="w-[3px] h-full bg-black flex-shrink-0" />
          <span className="truncate bg-black text-[#FFD166] px-2 py-0.5 border border-black" title={logicGraph.globalIntent}>
            {logicGraph.globalIntent}
          </span>
        </div>
      )}
    </footer>
  );
}
