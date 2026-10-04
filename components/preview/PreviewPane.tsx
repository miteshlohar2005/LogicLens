"use client";

import { useGenerationStore } from "@/store/generationStore";
import { Sandpack } from "@codesandbox/sandpack-react";
import { buildSandpackFiles } from "@/lib/sandbox/sandpackConfig";
import CodeViewer from "./CodeViewer";

export default function PreviewPane() {
  const status = useGenerationStore((s) => s.status);
  const files = useGenerationStore((s) => s.files);

  const isGenerating = status === "generating";
  const isParsing = status === "parsing";
  const hasFiles = files && files.length > 0;

  if (isParsing) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#FFFDF8] border-l-[3px] border-black relative items-center justify-center p-8 text-center">
        <div className="w-24 h-24 border-[4px] border-black bg-[#06D6A0] flex items-center justify-center mb-6 shadow-[8px_8px_0_0_#000]">
          <svg className="w-10 h-10 text-black animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
            <path d="M22 12A10 10 0 0 0 12 2v0" />
          </svg>
        </div>
        <h3 className="text-black font-black text-2xl uppercase mb-2">Analyzing Intent...</h3>
        <p className="text-black font-bold max-w-[250px] border-2 border-dashed border-black p-4 bg-white">
          AI is extracting nodes, edges, and logic from your sketch.
        </p>
      </div>
    );
  }

  // We are streaming, show the CodeViewer with the raw text
  if (isGenerating && hasFiles && files[0].path === "__streaming__") {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#E5E5E5] border-l-[3px] border-black relative">
        <div className="flex items-center px-4 py-3 border-b-[3px] border-black bg-[#FFD166]">
          <div className="w-3 h-3 border-2 border-black bg-black mr-3 shadow-[2px_2px_0_0_#000] animate-pulse" />
          <span className="text-sm font-black text-black uppercase tracking-widest">
            SYNTHESIZING CODE...
          </span>
        </div>
        <div className="p-4 flex-1 overflow-hidden flex flex-col">
           <CodeViewer content={files[0].content} />
        </div>
      </div>
    );
  }

  // Done generating, show the Sandpack preview
  if (hasFiles && files[0].path !== "__streaming__") {
    const sandpackFiles = buildSandpackFiles(files);
    
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white border-l-[3px] border-black relative">
        <div className="flex items-center gap-2 px-4 py-2 border-b-[3px] border-black bg-[#E5E5E5]">
          <div className="w-4 h-4 border-2 border-black bg-[#EF476F]" />
          <div className="w-4 h-4 border-2 border-black bg-[#FFD166]" />
          <div className="w-4 h-4 border-2 border-black bg-[#06D6A0]" />
          <span className="ml-4 text-xs font-black uppercase tracking-widest text-black">Live Preview Sandbox</span>
        </div>
        <div className="flex-1 overflow-hidden brutal-sandpack-container">
          <Sandpack
            template="react-ts"
            theme="light"
            files={sandpackFiles}
            options={{
              showNavigator: true,
              showTabs: true,
              // @ts-expect-error: Undocumented prop but works to hide the CodeSandbox button
              showOpenInCodeSandbox: false,
              editorHeight: "100%",
              externalResources: ["https://cdn.tailwindcss.com"],
              classes: {
                "sp-wrapper": "h-full w-full",
                "sp-layout": "h-full w-full !border-none !rounded-none",
                "sp-tabs": "!border-b-2 !border-black !bg-white",
                "sp-tab-button": "!font-bold !text-black !rounded-none",
              }
            }}
            customSetup={{
              dependencies: {
                "lucide-react": "latest",
                "framer-motion": "latest",
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Empty state placeholder
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#FFFDF8] border-l-[3px] border-black relative items-center justify-center p-8 text-center">
      <div className="w-24 h-24 border-[4px] border-black bg-[#FFD166] flex items-center justify-center mb-6 shadow-[8px_8px_0_0_#000]">
        <svg className="w-10 h-10 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>
      <h3 className="text-black font-black text-2xl uppercase mb-2">No Output Yet</h3>
      <p className="text-black font-bold max-w-[250px] border-2 border-dashed border-black p-4 bg-white">
        Generate your intent to see the live preview and code.
      </p>
    </div>
  );
}
