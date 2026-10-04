"use client";

import { useEffect, useRef } from "react";

interface CodeViewerProps {
  content: string;
}

export default function CodeViewer({ content }: CodeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as code streams in
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative font-[family-name:var(--font-jetbrains-mono)] text-sm leading-relaxed bg-[#FFFDF8] border-[3px] border-black shadow-inner"
    >
      <pre className="text-black font-bold whitespace-pre-wrap break-words">
        {content}
      </pre>
      
      {/* Blinking cursor effect at the end of the text */}
      <span className="inline-block w-3 h-5 bg-[#EF476F] ml-1 align-middle animate-pulse border border-black" />
    </div>
  );
}
