"use client";

import { useState } from "react";
import { useGenerationStore } from "@/store/generationStore";
import { useCanvasStore } from "@/store/canvasStore";
import { motion } from "framer-motion";
import ApiKeyModal from "./ApiKeyModal";

interface TopBarProps {
  onGenerate?: () => void;
  onExport?: () => void;
}

export default function TopBar({ onGenerate, onExport }: TopBarProps) {
  const status = useGenerationStore((s) => s.status);
  const sketchImageBase64 = useCanvasStore((s) => s.sketchImageBase64);
  const isEmpty = useCanvasStore((s) => s.isEmpty);
  const userApiKey = useGenerationStore((s) => s.userApiKey);

  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const isGenerating = status === "parsing" || status === "generating";
  const hasOutput = status === "done" || status === "refining";
  const canGenerate = !isEmpty || !!sketchImageBase64;

  return (
    <header
      id="topbar"
      className="bg-white sticky top-0 z-50 flex items-center justify-between px-6 h-16 border-b-[3px] border-black"
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 select-none">
        <div className="flex items-center justify-center w-8 h-8 bg-black border-2 border-black">
          <svg
            className="w-5 h-5 text-white"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="14" height="14" fill="currentColor" />
            <path
              d="M10 2 L10 6 M10 14 L10 18 M2 10 L6 10 M14 10 L18 10"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>
        <span className="font-black text-lg uppercase tracking-tight text-black">
          LogicLens
        </span>
        <span className="hidden sm:block badge badge-brand bg-[#FFD166] text-black border-2 border-black">BETA</span>
      </div>

      {/* ── Center — pipeline stage indicator ── */}
      <div className="hidden md:flex items-center gap-2">
        {(["Draw", "Parse", "Generate", "Live"] as const).map((stage, idx) => {
          const stageStatus = getStageStatus(stage, status);
          return (
            <div key={stage} className="flex items-center gap-2">
              {idx > 0 && (
                <div className="w-4 h-[3px] bg-black" />
              )}
              <div
                className={`flex items-center gap-2 px-3 py-1 font-bold text-xs uppercase border-2 border-black transition-none ${
                  stageStatus === "active"
                    ? "bg-[#FFD166] text-black shadow-[2px_2px_0px_#000]"
                    : stageStatus === "done"
                    ? "bg-[#06D6A0] text-black"
                    : "bg-[#E5E5E5] text-[#666]"
                }`}
              >
                {stageStatus === "active" && (
                  <div className="w-2 h-2 bg-[#EF476F] border border-black animate-pulse" />
                )}
                {stageStatus === "done" && (
                  <span className="text-black text-xs">✓</span>
                )}
                {stage}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-4">

        {/* Custom Key Button - Always visible, but modal has a warning */}
        <button
          onClick={() => setIsKeyModalOpen(true)}
          className={`brutal-btn-ghost px-3 ${userApiKey ? "bg-[#FFD166]" : ""}`}
          aria-label="Set Custom API Key"
          title="Set Custom API Key"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
          <span className="hidden sm:inline">{userApiKey ? "Key Set" : "Key"}</span>
        </button>

        {/* Export button — only shown when there's generated output */}
        {hasOutput && (
          <button
            id="topbar-export-btn"
            onClick={onExport}
            className="brutal-btn-ghost"
            aria-label="Export generated code"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M21 15v4H3v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export</span>
          </button>
        )}

        {/* Generate button */}
        <button
          id="topbar-generate-btn"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="brutal-btn"
          aria-label="Generate app from sketch"
        >
          {isGenerating ? (
            <>
              <span className="animate-pulse">████████░░</span>
              <span>{status === "parsing" ? "PARSING…" : "GENERATING…"}</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Generate</span>
            </>
          )}
        </button>
      </div>

      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
    </header>
  );
}

type Stage = "Draw" | "Parse" | "Generate" | "Live";
type StageStatus = "inactive" | "active" | "done";

function getStageStatus(stage: Stage, status: ReturnType<typeof useGenerationStore.getState>["status"]): StageStatus {
  switch (stage) {
    case "Draw":
      return status === "idle" ? "active" : "done";
    case "Parse":
      if (status === "parsing") return "active";
      if (["parse-done", "generating", "done", "refining"].includes(status)) return "done";
      return "inactive";
    case "Generate":
      if (status === "generating") return "active";
      if (["done", "refining"].includes(status)) return "done";
      return "inactive";
    case "Live":
      if (status === "done" || status === "refining") return "active";
      return "inactive";
    default:
      return "inactive";
  }
}
