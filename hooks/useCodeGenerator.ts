"use client";

import { useCallback } from "react";
import { useCanvasStore } from "@/store/canvasStore";
import { useGenerationStore } from "@/store/generationStore";

export function useCodeGenerator() {
  const sketchImageBase64 = useCanvasStore((s) => s.sketchImageBase64);
  const logicGraph = useGenerationStore((s) => s.logicGraph);
  const setStatus = useGenerationStore((s) => s.setStatus);
  const setError = useGenerationStore((s) => s.setError);
  const setFiles = useGenerationStore((s) => s.setFiles);
  const appendFileChunk = useGenerationStore((s) => s.appendFileChunk);
  const setActiveKeyIndex = useGenerationStore((s) => s.setActiveKeyIndex);
  const setLastLatencyMs = useGenerationStore((s) => s.setLastLatencyMs);

  const generate = useCallback(async (imageBase64?: string, currentLogicGraph?: any) => {
    const image = imageBase64 ?? sketchImageBase64;
    const graphToUse = currentLogicGraph ?? logicGraph;
    if (!image || !graphToUse) {
      setError("Cannot generate code: missing sketch image or parsed logic graph.");
      return;
    }

    setStatus("generating");
    setFiles([]); // clear previous files
    const start = Date.now();

    const userApiKey = useGenerationStore.getState().userApiKey;

    try {
      const res = await fetch("/api/generate-code", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(userApiKey ? { "x-user-api-key": userApiKey } : {})
        },
        body: JSON.stringify({ imageBase64: image, logicGraph: graphToUse }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE events
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? ""; // keep the last incomplete chunk in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            let data;
            try {
              data = JSON.parse(line.slice(6));
            } catch (err) {
              console.error("Failed to parse SSE line:", line, err);
              continue;
            }
            
            switch (data.type) {
              case "key-switch":
                console.log("[useCodeGenerator] Switching to Key 2");
                break;
              case "key-active":
                setActiveKeyIndex(data.keyIndex);
                break;
              case "chunk":
                // For now, we just stream text into a special "__streaming__" file for the CodeViewer
                appendFileChunk("__streaming__", data.text);
                break;
              case "done":
                // Replace the streaming buffer with the final structured files
                setFiles(data.files);
                setStatus("done");
                setLastLatencyMs(Date.now() - start);
                break;
              case "done-raw":
                // Fallback if JSON parse fails on backend
                console.warn("Received done-raw, falling back to basic App.tsx");
                setFiles([{ path: "App.tsx", content: data.text }]);
                setStatus("done");
                setLastLatencyMs(Date.now() - start);
                break;
              case "error":
                throw new Error(data.message);
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Code generation failed";
      setError(message);
    }
  }, [sketchImageBase64, logicGraph, setStatus, setFiles, setError, appendFileChunk, setActiveKeyIndex, setLastLatencyMs]);

  return { generate };
}
