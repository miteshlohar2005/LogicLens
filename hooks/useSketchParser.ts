"use client";

import { useCallback } from "react";
import { useCanvasStore } from "@/store/canvasStore";
import { useGenerationStore } from "@/store/generationStore";
import { type LogicGraph } from "@/lib/schemas/logicGraph";

export function useSketchParser() {
  const sketchImageBase64 = useCanvasStore((s) => s.sketchImageBase64);
  const setStatus = useGenerationStore((s) => s.setStatus);
  const setLogicGraph = useGenerationStore((s) => s.setLogicGraph);
  const setError = useGenerationStore((s) => s.setError);
  const setActiveKeyIndex = useGenerationStore((s) => s.setActiveKeyIndex);
  const setLastLatencyMs = useGenerationStore((s) => s.setLastLatencyMs);

  const parse = useCallback(async (imageBase64?: string): Promise<LogicGraph | null> => {
    const image = imageBase64 ?? sketchImageBase64;
    if (!image) {
      setError("No sketch image available. Draw something or upload a photo first.");
      return null;
    }

    setStatus("parsing");
    const start = Date.now();

    const userApiKey = useGenerationStore.getState().userApiKey;

    try {
      const res = await fetch("/api/parse-sketch", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(userApiKey ? { "x-user-api-key": userApiKey } : {})
        },
        body: JSON.stringify({ imageBase64: image }),
      });

      if (!res.ok) {
        const { error } = await res.json() as { error: string };
        throw new Error(error ?? `HTTP ${res.status}`);
      }

      const { logicGraph } = await res.json() as { logicGraph: LogicGraph };
      setLogicGraph(logicGraph);
      setStatus("parse-done");
      setLastLatencyMs(Date.now() - start);
      // Key index comes from the server — default to 1 if not specified
      setActiveKeyIndex(1);
      return logicGraph;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sketch parsing failed";
      setError(message);
      return null;
    }
  }, [sketchImageBase64, setStatus, setLogicGraph, setError, setActiveKeyIndex, setLastLatencyMs]);

  return { parse };
}
