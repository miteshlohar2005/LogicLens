import { create } from "zustand";

export interface LogicNode {
  id: string;
  type:
    | "container"
    | "button"
    | "input"
    | "text"
    | "icon"
    | "list"
    | "counter"
    | "unknown";
  label: string;
  boundingBox: { x: number; y: number; w: number; h: number };
  inferredComponent: string;
}

export interface LogicEdge {
  id: string;
  sourceId: string;
  targetId: string;
  annotation: string;
  inferredBehavior: string;
  confidence: number;
}

export interface LogicGraph {
  nodes: LogicNode[];
  edges: LogicEdge[];
  globalIntent: string;
  suggestedComponents: string[];
  aiReasoning: string;
}

export interface CodeFile {
  path: string;
  content: string;
}

export interface GeneratedProject {
  files: CodeFile[];
  entryPoint: string;
  dependencies: Record<string, string>;
}

export type GenerationStatus =
  | "idle"
  | "parsing"
  | "parse-done"
  | "generating"
  | "done"
  | "refining"
  | "error";

interface GenerationStore {
  // Phase 1 result — semantic graph
  logicGraph: LogicGraph | null;
  // Phase 2 result — generated code files (and streaming chunks)
  files: CodeFile[];
  // Current pipeline status
  status: GenerationStatus;
  // Active Gemini API key indicator (1 or 2)
  activeKeyIndex: 1 | 2;
  // Last generation latency in ms
  lastLatencyMs: number | null;
  // Error message if status === 'error'
  errorMessage: string | null;
  // User's custom API key
  userApiKey: string | null;

  // Actions
  setLogicGraph: (graph: LogicGraph) => void;
  setFiles: (files: CodeFile[]) => void;
  appendFileChunk: (path: string, content: string) => void;
  setStatus: (status: GenerationStatus) => void;
  setActiveKeyIndex: (idx: 1 | 2) => void;
  setLastLatencyMs: (ms: number) => void;
  setError: (message: string) => void;
  setUserApiKey: (key: string | null) => void;
  reset: () => void;
}

const initialState = {
  logicGraph: null,
  files: [],
  status: "idle" as GenerationStatus,
  activeKeyIndex: 1 as 1 | 2,
  lastLatencyMs: null,
  errorMessage: null,
  userApiKey: null,
};

export const useGenerationStore = create<GenerationStore>((set, get) => ({
  ...initialState,

  setLogicGraph: (logicGraph) => set({ logicGraph }),

  setFiles: (files) => set({ files }),

  appendFileChunk: (path, content) => {
    const existing = get().files;
    const fileIndex = existing.findIndex((f) => f.path === path);
    if (fileIndex >= 0) {
      const updated = [...existing];
      updated[fileIndex] = {
        ...updated[fileIndex],
        content: updated[fileIndex].content + content,
      };
      set({ files: updated });
    } else {
      set({ files: [...existing, { path, content }] });
    }
  },

  setStatus: (status) => set({ status, errorMessage: null }),

  setActiveKeyIndex: (activeKeyIndex) => set({ activeKeyIndex }),

  setLastLatencyMs: (lastLatencyMs) => set({ lastLatencyMs }),

  setError: (errorMessage) => set({ status: "error", errorMessage }),

  setUserApiKey: (userApiKey) => set({ userApiKey }),

  reset: () => set(initialState),
}));
