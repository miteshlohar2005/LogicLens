import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  // If this message triggered a code change, list the changed file paths
  changedFiles?: string[];
}

interface ChatStore {
  messages: ChatMessage[];
  isOpen: boolean;
  isStreaming: boolean;

  // Actions
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  updateLastAssistantMessage: (content: string) => void;
  setIsOpen: (open: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  clearHistory: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isOpen: false,
  isStreaming: false,

  addMessage: (msg) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    set((state) => ({ messages: [...state.messages, newMsg] }));
  },

  updateLastAssistantMessage: (content) => {
    const messages = [...get().messages];
    const lastIdx = messages.findLastIndex((m) => m.role === "assistant");
    if (lastIdx >= 0) {
      messages[lastIdx] = { ...messages[lastIdx], content };
      set({ messages });
    }
  },

  setIsOpen: (isOpen) => set({ isOpen }),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  clearHistory: () => set({ messages: [], isStreaming: false }),
}));
