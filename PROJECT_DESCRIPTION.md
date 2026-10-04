# LogicLens — Project Description

**LogicLens** is an advanced, AI-powered **Intent-to-App Engine**. It bridges the gap between rough ideation and functional software by transforming hand-drawn sketches, wireframes, and logic flowcharts into production-ready React code in real-time.

While traditional no-code tools focus solely on static UI conversion, LogicLens focuses on **Topological Intent Extraction**. It treats human scribbles, arrows, and spatial annotations as a definitive **Semantic Logic Graph**. It doesn't just build a UI; it builds a functional blueprint where the visual relationships drawn by the user natively define the application's state, data flow, and behavior.

---

## Core Operational Phases

### 1. Multimodal Input & Interpretation
- **The Source:** Users draw directly on an integrated Excalidraw digital whiteboard. 
- **Visual Parsing:** The system goes beyond simple shape detection. It recognizes "Logical Anchors." For example, an arrow connecting a button to a counter box with a scribble saying "increment" is interpreted as a precise React state interaction.

### 2. Executable Code Synthesis
- **Frontend Generation:** LogicLens generates high-fidelity, responsive UI using Next.js, React 19, and Tailwind CSS v4.
- **Logic Wiring:** The system synthesizes the necessary hooks, state management (Zustand), and event handlers based entirely on the parsed logic graph.
- **Live Sandbox:** The resulting application is instantly mounted in a real-time, client-side Sandpack environment, allowing the user to click, interact, and verify the logic immediately without any server-side compilation delays.

### 3. Conversational Refinement
- **Surgical Updates:** Users refine the generated app using natural language (e.g., *"Make the list sortable"* or *"Switch to a dark theme"*). The AI surgically patches the specific files in milliseconds rather than regenerating the entire codebase from scratch, preserving existing state and logic.

---

## Technical Philosophy
LogicLens was built as a frictionless, high-performance engineering tool.
- **100% Serverless:** Utilizing Next.js Edge Functions to support long-lived Server-Sent Event (SSE) streams.
- **Dual-Model Architecture:** Leveraging Gemini 2.5 Flash for rapid, cheap structured data extraction, combined with Gemini 2.5 Pro for deep, multi-file codebase synthesis.
- **No Dependencies:** Zero requirements for a database, authentication, or paid compute containers. The entire pipeline runs securely and efficiently between Edge API routes and the client browser.