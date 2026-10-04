"use client";

// REQUIRED: Excalidraw 0.18+ ships its own CSS that must be explicitly imported.
// Without this, the icon font (excalifont) fails to load and toolbar icons
// render as giant fallback SVGs.
import "@excalidraw/excalidraw/index.css";

import { useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useCanvasStore } from "@/store/canvasStore";
import { motion, AnimatePresence } from "framer-motion";

// Excalidraw must be dynamically imported — it uses browser-only APIs
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false, loading: () => <CanvasLoading /> }
);

function CanvasLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#FFFDF8]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-[4px] border-black border-t-[#EF476F] animate-spin" />
        <span className="text-black font-black uppercase tracking-widest bg-[#FFD166] px-2 py-1 border-2 border-black">Loading canvas…</span>
      </div>
    </div>
  );
}

interface WorkspaceCanvasProps {
  onSnapshotReady?: (base64: string) => void;
}

export default function WorkspaceCanvas({ onSnapshotReady }: WorkspaceCanvasProps) {
  const excalidrawApiRef = useRef<any>(null);
  const setElements = useCanvasStore((s) => s.setElements);
  const setSketchImageBase64 = useCanvasStore((s) => s.setSketchImageBase64);
  const isEmpty = useCanvasStore((s) => s.isEmpty);

  // Export the current canvas as a base64 PNG
  const exportSnapshot = useCallback(async (): Promise<string | null> => {
    const api = excalidrawApiRef.current;
    if (!api) return null;

    const elements = api.getSceneElements().filter((el: any) => !el.isDeleted);
    if (!elements || elements.length === 0) return null;

    try {
      const { exportToBlob } = await import("@excalidraw/excalidraw");
      const blob = await exportToBlob({
        elements,
        appState: {
          ...api.getAppState(),
          exportWithDarkMode: false,
          exportBackground: true,
        },
        files: api.getFiles(),
        mimeType: "image/png",
        quality: 0.95,
      });

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Strip the data URL prefix — keep only the base64 content
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Snapshot export failed:", err);
      return null;
    }
  }, []);

  // Expose snapshot function to parent via store
  useEffect(() => {
    // Store the export function so TopBar's Generate button can call it
    (window as Window & { __excalidrawExport?: () => Promise<string | null> }).__excalidrawExport = exportSnapshot;
  }, [exportSnapshot]);

  return (
    <div className="relative w-full h-full" style={{ width: "100%", height: "100%", minHeight: 0 }}>
      {/* Excalidraw canvas */}
      <div
        className="absolute inset-0"
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
      >
        <Excalidraw
          excalidrawAPI={(api) => {
            excalidrawApiRef.current = api;
          }}
          theme="light"
          UIOptions={{
            canvasActions: {
              changeViewBackgroundColor: false,
              export: false,
              loadScene: false,
              saveToActiveFile: false,
              saveAsImage: false,
            },
            tools: { image: true },
          }}
          initialData={{
            appState: {
              viewBackgroundColor: "#FFFDF8",
              theme: "light",
            },
          }}
          onChange={(elements) => {
            setElements(elements as unknown[]);
          }}
        />
      </div>

      {/* Empty state — pulsing "Draw your intent" prompt */}
      <AnimatePresence>
        {isEmpty && (
          <motion.div
            key="empty-prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6 select-none pointer-events-none">
              {/* Pulsing box */}
              <motion.div
                className="w-20 h-20 border-[4px] border-black bg-white flex items-center justify-center shadow-[4px_4px_0_0_#000]"
                animate={{
                  boxShadow: [
                    "4px 4px 0 0 #000",
                    "12px 12px 0 0 #000",
                    "4px 4px 0 0 #000",
                  ],
                  translateX: [0, -4, 0],
                  translateY: [0, -4, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg
                  className="w-10 h-10 text-black"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </motion.div>

              <div className="text-center bg-white border-[3px] border-black p-4 shadow-[4px_4px_0_0_#000]">
                <motion.p
                  className="text-black text-xl font-black uppercase tracking-widest mb-1"
                >
                  Draw your intent
                </motion.p>
                <p className="text-black font-bold text-sm">
                  Sketch boxes, arrows, and labels — then hit <span className="bg-[#06D6A0] px-1 border border-black">Generate</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Exported helper — called by the Generate button in TopBar
export async function captureCanvasSnapshot(setSketchImageBase64: (b: string | null) => void): Promise<string | null> {
  const exportFn = (window as Window & { __excalidrawExport?: () => Promise<string | null> }).__excalidrawExport;
  if (!exportFn) return null;
  const base64 = await exportFn();
  if (base64) setSketchImageBase64(base64);
  return base64;
}
