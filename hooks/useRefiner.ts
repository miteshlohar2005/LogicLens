"use client";

import { useCallback } from "react";
import { useCanvasStore } from "@/store/canvasStore";
import { useGenerationStore } from "@/store/generationStore";
import { useChatStore } from "@/store/chatStore";

export function useRefiner() {
  const sketchImageBase64 = useCanvasStore((s) => s.sketchImageBase64);
  const logicGraph = useGenerationStore((s) => s.logicGraph);
  const files = useGenerationStore((s) => s.files);
  const setStatus = useGenerationStore((s) => s.setStatus);
  const setFiles = useGenerationStore((s) => s.setFiles);
  const appendFileChunk = useGenerationStore((s) => s.appendFileChunk);
  const setLastLatencyMs = useGenerationStore((s) => s.setLastLatencyMs);
  const setError = useGenerationStore((s) => s.setError);

  const addMessage = useChatStore((s) => s.addMessage);
  const setIsStreaming = useChatStore((s) => s.setIsStreaming);
  const updateLastAssistantMessage = useChatStore((s) => s.updateLastAssistantMessage);

  const refine = useCallback(async (userMessage: string) => {
    if (!sketchImageBase64 || !logicGraph || files.length === 0) {
      setError("Cannot refine: missing sketch, logic graph, or generated files.");
      return;
    }

    // Add user message to chat
    addMessage({ role: "user", content: userMessage });

    // Add initial assistant message placeholder
    addMessage({ role: "assistant", content: "Synthesizing code patches..." });
    
    setStatus("refining");
    setIsStreaming(true);
    const start = Date.now();

    // Make a backup of the current files to restore if refinement fails or to merge changes
    const previousFiles = [...files];
    // Remove the streaming placeholder from files to prepare for new patches
    setFiles(previousFiles.filter(f => f.path !== "__streaming__"));

    const userApiKey = useGenerationStore.getState().userApiKey;

    try {
      const res = await fetch("/api/refine-code", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(userApiKey ? { "x-user-api-key": userApiKey } : {})
        },
        body: JSON.stringify({
          imageBase64: sketchImageBase64,
          logicGraph,
          currentFiles: previousFiles,
          userMessage
        }),
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
      let patchBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

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
              case "chunk":
                patchBuffer += data.text;
                // Optional: update the assistant message with the raw JSON text temporarily
                // updateLastAssistantMessage("\`\`\`json\n" + patchBuffer + "\n\`\`\`");
                break;
              case "done": {
                // data.patchedFiles is an array of { path, content } that have been changed.
                // Merge these into the existing files.
                const patchedMap = new Map(data.patchedFiles.map((f: any) => [f.path, f.content]));
                const mergedFiles = previousFiles.map(f => {
                  if (patchedMap.has(f.path)) {
                    patchedMap.delete(f.path);
                    return { ...f, content: data.patchedFiles.find((pf: any) => pf.path === f.path)!.content };
                  }
                  return f;
                });
                
                // Add any completely new files
                for (const [path, content] of Array.from(patchedMap.entries())) {
                  mergedFiles.push({ path: path as string, content: content as string });
                }
                
                setFiles(mergedFiles);
                
                // Update chat message with summary
                const changedPaths = data.patchedFiles.map((f: any) => f.path);
                updateLastAssistantMessage(`Applied patches to ${changedPaths.join(", ")}`);
                
                setStatus("done");
                setLastLatencyMs(Date.now() - start);
                setIsStreaming(false);
                break;
              }
              case "done-raw":
                console.warn("Failed to parse backend JSON, restoring previous files");
                setFiles(previousFiles);
                updateLastAssistantMessage("Failed to apply patch due to JSON formatting error.");
                setStatus("error");
                setIsStreaming(false);
                break;
              case "error":
                throw new Error(data.message);
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Refinement failed";
      setError(message);
      setStatus("done");
      setIsStreaming(false);
      updateLastAssistantMessage("Failed: " + message);
    }
  }, [sketchImageBase64, logicGraph, files, setStatus, setFiles, setError, addMessage, setIsStreaming, updateLastAssistantMessage, setLastLatencyMs]);

  return { refine };
}
