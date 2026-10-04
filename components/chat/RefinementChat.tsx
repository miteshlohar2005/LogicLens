"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/store/chatStore";
import { useGenerationStore } from "@/store/generationStore";
import { useRefiner } from "@/hooks/useRefiner";
import { Send, Terminal, ChevronDown, ChevronUp, Bot, User, Loader2 } from "lucide-react";

export default function RefinementChat() {
  const { messages, isOpen, setIsOpen, isStreaming } = useChatStore();
  const logicGraph = useGenerationStore((s) => s.logicGraph);
  const status = useGenerationStore((s) => s.status);
  const { refine } = useRefiner();
  
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMsg = input.trim();
    setInput("");
    await refine(userMsg);
  };

  // Only show the chat drawer if generation is complete or we are currently refining
  if (status !== "done" && status !== "refining" && status !== "error") return null;

  return (
    <div className="absolute bottom-8 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <motion.div 
        className="w-[600px] pointer-events-auto bg-white border-4 border-black rounded-none shadow-[8px_8px_0_0_#000] flex flex-col"
        initial={false}
        animate={{ 
          height: isOpen ? "400px" : "56px",
          y: isOpen ? 0 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header / Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-[#FFD166] hover:bg-[#EF476F] hover:text-white transition-colors w-full cursor-pointer outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="bg-black p-1">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-black uppercase tracking-tight">
              Refinement Chat
            </span>
          </div>
          <div className="bg-white border-2 border-black p-1 text-black">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {/* Content Area */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-hidden bg-[#FFFDF8]"
            >
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* AI Reasoning Block */}
                {logicGraph?.aiReasoning && messages.length === 0 && (
                  <div className="bg-white border-4 border-black p-3 text-sm font-bold shadow-[4px_4px_0_0_#000]">
                    <span className="text-[#118AB2] font-black uppercase block mb-1">AI Reasoning:</span>
                    {logicGraph.aiReasoning}
                  </div>
                )}

                {/* Messages */}
                {messages.length === 0 ? (
                  <div className="text-center text-base font-bold text-gray-500 mt-10 p-6 border-2 border-dashed border-gray-400 bg-white">
                    Ask LogicLens to modify the generated app! <br/>
                    (e.g. "make the button red" or "add a password field")
                  </div>
                ) : (
                  messages.map((msg) => (
                    <motion.div 
                      key={msg.id} 
                      initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-10 h-10 border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_0_#000] ${msg.role === "user" ? "bg-[#EF476F] text-white" : "bg-[#118AB2] text-white"}`}>
                        {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                      </div>
                      <div className={`px-4 py-2 border-2 border-black text-base font-bold max-w-[85%] shadow-[4px_4px_0_0_#000] ${msg.role === "user" ? "bg-white text-black" : "bg-[#E5E5E5] text-black"}`}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="p-4 border-t-4 border-black bg-white">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isStreaming ? "Applying patches..." : "Type a refinement..."}
                    disabled={isStreaming}
                    className="w-full bg-white border-4 border-black pl-4 pr-16 py-3 text-base font-bold text-black placeholder-gray-500 focus:outline-none focus:shadow-[4px_4px_0_0_#000] transition-shadow disabled:bg-gray-200"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isStreaming}
                    className="absolute right-2 p-2 bg-[#06D6A0] border-2 border-black text-black hover:bg-[#FFD166] disabled:opacity-50 disabled:bg-gray-300 transition-colors cursor-pointer"
                  >
                    {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
