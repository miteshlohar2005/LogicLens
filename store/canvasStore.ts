import { create } from "zustand";

export type ScanState = "idle" | "capturing" | "captured";

interface CanvasStore {
  // The raw Excalidraw elements (passed back from the component)
  elements: unknown[];
  // Base64 PNG snapshot of the current canvas or uploaded photo
  sketchImageBase64: string | null;
  // Webcam / scan modal state
  scanState: ScanState;
  // Whether the canvas is blank (no elements drawn)
  isEmpty: boolean;

  // Actions
  setElements: (elements: unknown[]) => void;
  setSketchImageBase64: (base64: string | null) => void;
  setScanState: (state: ScanState) => void;
  setIsEmpty: (isEmpty: boolean) => void;
  reset: () => void;
}

const initialState = {
  elements: [],
  sketchImageBase64: null,
  scanState: "idle" as ScanState,
  isEmpty: true,
};

export const useCanvasStore = create<CanvasStore>((set) => ({
  ...initialState,

  setElements: (elements) =>
    set({ elements, isEmpty: elements.length === 0 }),

  setSketchImageBase64: (base64) => set({ sketchImageBase64: base64 }),

  setScanState: (scanState) => set({ scanState }),

  setIsEmpty: (isEmpty) => set({ isEmpty }),

  reset: () => set(initialState),
}));
