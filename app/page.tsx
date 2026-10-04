"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="w-6 h-6">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: "Draw Your Intent",
    desc: "Sketch on an infinite canvas or scan a paper napkin. Arrows become event handlers. Boxes become components.",
    color: "bg-[#FFD166]",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="w-6 h-6">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    title: "AI Topology Extraction",
    desc: "Our AI engine reads your sketch and constructs a Semantic Logic Graph — nodes, edges, behaviors, and intent.",
    color: "bg-[#06D6A0]",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="w-6 h-6">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: "Live Code Synthesis",
    desc: "We parse the image AND the logic graph to generate production-ready React + Tailwind code that actually runs.",
    color: "bg-[#EF476F]",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="w-6 h-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Conversational Refinement",
    desc: "Chat to refine. \"Make it Cyberpunk.\" \"Add a sort button.\" Surgical edits. Preview updates instantly.",
    color: "bg-[#118AB2]",
  },
];

const steps = [
  { num: "01", label: "Draw", desc: "Sketch your UI on the canvas" },
  { num: "02", label: "Parse", desc: "AI extracts the logic graph" },
  { num: "03", label: "Generate", desc: "Code streams in real-time" },
  { num: "04", label: "Refine", desc: "Chat to iterate surgically" },
];

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-[#FFFDF8]">
      {/* ── Nav ── */}
      <nav className="border-b-[4px] border-black sticky top-0 z-50 bg-[#FFD166]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 select-none">
            <div className="w-10 h-10 bg-black flex items-center justify-center border-4 border-black shadow-[4px_4px_0_0_#EF476F]">
              <svg className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="14" height="14" fill="currentColor" />
                <path d="M10 2 L10 6 M10 14 L10 18 M2 10 L6 10 M14 10 L18 10" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase drop-shadow-[2px_2px_0px_#FFF]">LogicLens</span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.linkedin.com/in/mitesh-ramesh-lohar/?isSelfProfile=true" 
              target="_blank" 
              rel="noopener noreferrer"
              className="brutal-btn-ghost hidden sm:flex text-sm py-2 px-4 bg-white hover:bg-[#118AB2] hover:text-white"
            >
              LINKEDIN
            </a>
            <a 
              href="https://github.com/miteshlohar2005" 
              target="_blank" 
              rel="noopener noreferrer"
              className="brutal-btn-ghost hidden sm:flex text-sm py-2 px-4 bg-white hover:bg-[#118AB2] hover:text-white"
            >
              GITHUB
            </a>
            <Link
              href="/canvas"
              id="nav-launch-btn"
              className="brutal-btn py-2 px-6 bg-[#06D6A0] text-black hover:bg-black hover:text-white"
            >
              Launch App →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-32 border-b-[4px] border-black bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')]">
        
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter uppercase leading-none max-w-6xl text-black"
        >
          <span className="bg-[#EF476F] text-white px-6 py-2 border-[6px] border-black inline-block transform -rotate-3 mb-6 shadow-[12px_12px_0_0_#000]">Sketch.</span>
          <br />
          <span className="bg-white px-6 py-2 border-[6px] border-black inline-block transform rotate-1 shadow-[12px_12px_0_0_#000]">Watch it build.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-16 text-2xl sm:text-3xl text-black font-bold max-w-3xl leading-snug border-[4px] border-black bg-[#FFD166] p-6 shadow-[8px_8px_0_0_#000]"
        >
          LogicLens is a <strong className="font-black underline decoration-4 decoration-[#06D6A0]">Semantic Intent Engine</strong>.
          Draw arrows, boxes, and scribbles. Our AI reads the logic and synthesizes a fully interactive React app.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8"
        >
          <Link href="/canvas" id="hero-launch-btn" className="brutal-btn text-2xl py-6 px-12 bg-black text-white hover:bg-[#06D6A0] hover:text-black">
            <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start Drawing Now
          </Link>
        </motion.div>

        {/* Mock sketch preview (Login Form) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-32 w-full max-w-5xl relative"
        >
          <div className="brutal-card p-0 overflow-hidden border-[6px] shadow-[16px_16px_0_0_#000]">
            {/* Fake window chrome */}
            <div className="flex items-center gap-3 px-6 py-4 border-b-[6px] border-black bg-[#118AB2]">
              <div className="w-5 h-5 border-4 border-black bg-white" />
              <div className="w-5 h-5 border-4 border-black bg-white" />
              <div className="w-5 h-5 border-4 border-black bg-white" />
              <span className="ml-4 text-lg font-black uppercase tracking-widest text-white">LogicLens Engine</span>
            </div>
            {/* Sketch illustration (Story flow) */}
            <div className="flex flex-col md:flex-row min-h-[400px] bg-[#E5E5E5] relative">
              
              {/* Step 1: Draw */}
              <div className="flex-1 border-b-[6px] md:border-b-0 md:border-r-[6px] border-black p-6 bg-[#FFFDF8] relative overflow-hidden flex flex-col items-center justify-center pb-20 md:pb-6">
                <div className="absolute top-2 left-2 bg-black text-white text-xs font-black px-2 py-1 uppercase">1. Sketch</div>
                <div className="w-full max-w-[200px] border-4 border-black p-4 bg-white shadow-[4px_4px_0_0_#000]">
                  <div className="text-center font-bold font-mono mb-4 border-b-2 border-dashed border-gray-400 pb-2">Login</div>
                  <div className="h-6 border-4 border-black mb-3 bg-gray-100" />
                  <div className="h-6 border-4 border-black mb-4 bg-gray-100" />
                  <div className="h-8 bg-[#EF476F] border-4 border-black" />
                </div>
              </div>
              
              {/* Arrow Badge */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-14 h-14 bg-[#06D6A0] border-[4px] border-black shadow-[4px_4px_0_0_#000] rotate-45 hidden md:flex">
                <svg className="w-8 h-8 -rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>

              {/* Step 2: Code */}
              <div className="flex-1 p-6 bg-[#FFD166] relative overflow-hidden flex flex-col justify-center items-center pb-24 md:pb-6">
                <div className="absolute top-2 left-2 bg-black text-white text-xs font-black px-2 py-1 uppercase">2. Render</div>
                <div className="w-full max-w-[240px] border-[4px] border-black bg-white shadow-[8px_8px_0_0_#000] p-5 text-center">
                   <h3 className="font-black text-xl mb-4 uppercase">Sign In</h3>
                   <input disabled placeholder="Email..." className="w-full border-2 border-black p-2 mb-3 bg-[#E5E5E5] font-bold text-sm" />
                   <input disabled placeholder="Password..." className="w-full border-2 border-black p-2 mb-4 bg-[#E5E5E5] font-bold text-sm" />
                   <button className="w-full py-2 bg-[#118AB2] border-[3px] border-black text-white font-black hover:bg-black uppercase transition-colors">Login</button>
                </div>
              </div>

              {/* Step 3: Refine */}
              <div className="absolute bottom-6 left-6 right-6 md:left-1/4 md:right-1/4 bg-white border-[4px] border-black shadow-[8px_8px_0_0_#000] p-3 flex gap-3 z-20">
                 <div className="bg-[#EF476F] border-2 border-black w-10 h-10 flex items-center justify-center flex-shrink-0 text-white">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                 </div>
                 <div className="flex-1 border-2 border-black bg-[#E5E5E5] px-4 py-2 font-black text-sm sm:text-base flex items-center">
                    "Make the login button blue"
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-32 px-6 border-b-[4px] border-black bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl sm:text-6xl font-black text-black tracking-tighter uppercase inline-block border-b-[12px] border-[#06D6A0] pb-2">
              From sketch to code
            </h2>
            <p className="mt-8 text-black font-black text-2xl uppercase tracking-wider">Four brutal steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="brutal-card p-8 text-center relative border-[4px] hover:translate-x-[-6px] hover:translate-y-[-6px] transition-transform shadow-[8px_8px_0_0_#000] hover:shadow-[14px_14px_0_0_#000]"
                style={{ backgroundColor: i % 2 === 0 ? '#FFFDF8' : '#FFD166' }}
              >
                <div className="text-7xl font-black text-black mb-6 select-none drop-shadow-[4px_4px_0px_#FFF]">
                  {step.num}
                </div>
                <div className="text-black font-black text-3xl mb-4 uppercase bg-white border-4 border-black py-2">{step.label}</div>
                <div className="text-black font-bold text-lg leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-32 px-6 bg-[#E5E5E5] border-b-[4px] border-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl sm:text-6xl font-black text-black tracking-tighter uppercase inline-block border-b-[12px] border-[#EF476F] pb-2">
              Built for speed
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-10">
            {features.map((f, i) => {
              return (
                <div
                  key={f.title}
                  className="brutal-card border-[4px] p-10 hover:translate-x-[-6px] hover:translate-y-[-6px] hover:shadow-[14px_14px_0_0_#000] transition-all bg-white"
                >
                  <div className={`w-20 h-20 border-[6px] border-black flex items-center justify-center mb-8 text-black ${f.color} shadow-[6px_6px_0_0_#000]`}>
                    {f.icon}
                  </div>
                  <h3 className="text-black font-black text-3xl mb-6 uppercase">{f.title}</h3>
                  <p className="text-black font-bold text-xl leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-40 px-6 text-center bg-[#118AB2] border-b-[4px] border-black relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#FFD166] border-8 border-black rounded-full" />
        <div className="absolute bottom-10 -right-10 w-60 h-60 bg-[#EF476F] border-8 border-black" />
        
        <div className="relative max-w-3xl mx-auto border-[12px] border-black bg-white p-16 shadow-[24px_24px_0_0_#000]">
          <h2 className="text-6xl sm:text-7xl font-black tracking-tighter mb-8 uppercase text-black">
            Draw your intent.
          </h2>
          <p className="text-black font-bold text-2xl mb-12 bg-[#E5E5E5] p-4 border-4 border-black">
            No sign-up. No configuration. Just open the canvas and start building.
          </p>
          <Link href="/canvas" id="footer-cta-btn" className="brutal-btn text-3xl py-8 px-16 bg-[#06D6A0] text-black border-[6px]">
            Open Canvas →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-6 bg-black flex flex-col sm:flex-row items-center justify-between text-white font-bold text-sm uppercase tracking-widest border-t-8 border-white">
        <span>LogicLens · Intent-to-App Engine</span>
        <a 
          href="https://www.linkedin.com/in/mitesh-ramesh-lohar/?isSelfProfile=true" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-4 sm:mt-0 hover:text-[#06D6A0] underline decoration-2 underline-offset-4"
        >
          CONNECT WITH DEVELOPER (MITESH RAMESH LOHAR)
        </a>
      </footer>
    </main>
  );
}
