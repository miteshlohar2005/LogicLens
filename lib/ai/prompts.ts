import { type LogicGraph } from "@/lib/schemas/logicGraph";

const PARSE_SKETCH_PROMPT = `You are a UI Topologist and Semantic Logic Extractor.

Your task is to analyze the provided sketch image and extract a structured representation of the UI layout and its interactive logic.

## Instructions

1. **Nodes**: Identify every distinct UI element (boxes, buttons, input fields, text labels, icons, lists, counters, navigation items, etc.) and represent each as a LogicNode.
   - Estimate bounding boxes as pixel coordinates relative to the image dimensions.
   - Choose the most specific 'type' from: container, button, input, text, icon, list, counter, unknown.
   - Set 'inferredComponent' to a PascalCase React component name (e.g. "MedicineList", "DoseCounter", "SearchBar").

2. **Edges**: Identify every directional connection (arrows, lines, or spatial proximity suggesting data flow).
   - 'annotation': Copy any text scribbled on or near the arrow exactly as written.
   - 'inferredBehavior': Translate the annotation and arrow direction into a concrete code-level action (e.g. "onClick: increment counter by 1", "onChange: filter list items", "onSubmit: POST to /api/submit").
   - 'confidence': Rate 0.0–1.0 how certain you are about this connection's meaning.

3. **globalIntent**: One sentence summarizing the app's purpose (e.g. "Medication tracking dashboard with daily dose counter").

4. **suggestedComponents**: List the top-level React components needed (PascalCase names).

5. **aiReasoning**: 2–4 sentences explaining how you resolved ambiguous elements or arrows. Be specific.

## Output Format

Return ONLY valid JSON with NO markdown fences, NO commentary, NO explanation outside the JSON.
The JSON must conform exactly to this schema:

{
  "nodes": [
    {
      "id": "string (unique, e.g. node-1)",
      "type": "container|button|input|text|icon|list|counter|unknown",
      "label": "string (text visible in the sketch for this element)",
      "boundingBox": { "x": number, "y": number, "w": number, "h": number },
      "inferredComponent": "string (PascalCase React component name)"
    }
  ],
  "edges": [
    {
      "id": "string (unique, e.g. edge-1)",
      "sourceId": "string (node id)",
      "targetId": "string (node id)",
      "annotation": "string (text on/near the arrow, empty string if none)",
      "inferredBehavior": "string (concrete code-level action)",
      "confidence": number
    }
  ],
  "globalIntent": "string",
  "suggestedComponents": ["string"],
  "aiReasoning": "string"
}`;

export function buildParseSketchPrompt(): string {
  return PARSE_SKETCH_PROMPT;
}

export function buildImagePart(base64: string, mimeType: "image/png" | "image/jpeg" = "image/png") {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}

/** Retry helper — calls fn up to maxAttempts times, only retrying on schema validation errors */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 2,
  label = "operation"
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      console.warn(`[${label}] Attempt ${attempt}/${maxAttempts} failed:`, lastError.message);
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }
  }
  throw lastError;
}

export function buildCodeGenPrompt(logicGraph: LogicGraph): string {
  return `You are an expert React and Tailwind CSS developer generating production-quality, interactive frontend code.

## Your Task

Generate a complete, runnable React application based on the UI sketch and its extracted Semantic Logic Graph provided below.

## Inputs You Have

1. **The original sketch image** (attached) — use it for visual proportions, layout density, color tone, and spacing.
2. **The Semantic Logic Graph** (below) — use it for component structure, state logic, and event handlers.

## Semantic Logic Graph
${JSON.stringify(logicGraph, null, 2)}

## Code Generation Rules

1. **File structure**: Generate multiple files. Each component in its own file under \`components/\`. Main entry is \`App.tsx\`.
2. **Styling**: Use Tailwind CSS utility classes exclusively. Match the visual proportions from the sketch image.
3. **State**: Implement all state using React \`useState\` / \`useReducer\`. Wire every \`inferredBehavior\` from the edges as actual event handlers.
4. **Mock data**: Populate lists, counters, and inputs with realistic sample data matching the \`globalIntent\`.
5. **Interactivity**: Every button must have an \`onClick\`, every input an \`onChange\`. The app must actually work when rendered.
6. **Color scheme**: Use Tailwind colors that closely match the colors, backgrounds, and tones used in the original sketch image. If the sketch has a yellow background, generate code with a yellow background.
7. **No imports from outside**: Only use React, standard hooks, and Tailwind. No external libraries.

## Output Format

Return ONLY a JSON array of file objects. NO markdown fences. NO explanation outside JSON.

[
  { "path": "App.tsx", "content": "full file content here" },
  { "path": "components/ComponentName.tsx", "content": "full file content here" }
]

The \`content\` field must be the complete, valid TypeScript/TSX source code for that file.`;
}

export function buildRefinePrompt(
  logicGraph: LogicGraph,
  currentFiles: Array<{ path: string; content: string }>,
  userMessage: string
): string {
  const filesSummary = currentFiles.map((f) => `### ${f.path}\n\`\`\`tsx\n${f.content}\n\`\`\``).join("\n\n");

  return `You are a precise surgical code editor for a React + Tailwind application.

## Context

**Original sketch image** (attached) — the visual source of truth.
**Semantic Logic Graph**: ${JSON.stringify(logicGraph, null, 2)}

## Current Code Files
${filesSummary}

## User's Refinement Request
"${userMessage}"

## Instructions

1. Make ONLY the changes needed to fulfill the user's request.
2. Return ONLY the files that changed. Do NOT return unchanged files.
3. For each changed file, return the COMPLETE new content of that file (not a diff).
4. If the change requires a new file, include it.
5. Preserve all existing logic and state that is unrelated to the request.

## Output Format

Return ONLY a JSON array. NO markdown fences. NO commentary outside JSON.

[
  { "path": "App.tsx", "content": "complete new content" }
]`;
}
