"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerationStore } from "@/store/generationStore";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const userApiKey = useGenerationStore((s) => s.userApiKey);
  const setUserApiKey = useGenerationStore((s) => s.setUserApiKey);
  
  const [inputKey, setInputKey] = useState(userApiKey || "");

  const handleSave = () => {
    setUserApiKey(inputKey.trim() || null);
    onClose();
  };

  const handleClear = () => {
    setInputKey("");
    setUserApiKey(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#000000bb]"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white w-full max-w-lg pointer-events-auto border-[4px] border-black shadow-[8px_8px_0_0_#000] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b-[4px] border-black bg-[#E5E5E5]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black flex items-center justify-center text-[#FFD166] border-2 border-black">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                  </div>
                  <p className="text-black text-lg font-black uppercase tracking-tight">Custom API Key</p>
                </div>
                <button onClick={onClose} className="btn-icon bg-[#EF476F] hover:bg-[#FFD166]" aria-label="Close">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 bg-[#FFFDF8]">
                <div className="mb-6 p-4 bg-[#FFD166] text-black border-[3px] border-black font-bold text-sm shadow-[4px_4px_0_0_#000]">
                  ⚠️ <strong>RECOMMENDATION:</strong> We highly recommend using this feature <strong>ONLY</strong> if the default generation fails due to server rate limits.
                  <br /><br />
                  If you do need to use your own Gemini API key, it will be stored safely in your browser's memory and is never saved to our database.
                </div>
                
                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="api-key-input" className="block text-black font-black uppercase mb-2">Gemini API Key</label>
                    <input
                      id="api-key-input"
                      type="password"
                      placeholder="AIzaSy..."
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      className="w-full bg-white border-[4px] border-black p-3 text-base font-bold text-black focus:outline-none focus:shadow-[4px_4px_0_0_#000] transition-shadow"
                    />
                  </div>
                  
                  <div className="flex gap-4 mt-2">
                    <button onClick={handleClear} className="brutal-btn-ghost flex-1 justify-center py-3 bg-[#E5E5E5]">Clear</button>
                    <button onClick={handleSave} className="brutal-btn flex-1 justify-center py-3 bg-[#06D6A0]">Save Key</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
