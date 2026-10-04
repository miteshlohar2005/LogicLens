import { z } from "zod";

export const LogicNodeSchema = z.object({
  id: z.string(),
  type: z.enum([
    "container",
    "button",
    "input",
    "text",
    "icon",
    "list",
    "counter",
    "unknown",
  ]),
  label: z.string(),
  boundingBox: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  }),
  inferredComponent: z.string(),
});

export const LogicEdgeSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  annotation: z.string(),
  inferredBehavior: z.string(),
  confidence: z.number().min(0).max(1),
});

export const LogicGraphSchema = z.object({
  nodes: z.array(LogicNodeSchema),
  edges: z.array(LogicEdgeSchema),
  globalIntent: z.string(),
  suggestedComponents: z.array(z.string()),
  aiReasoning: z.string(),
});

export type LogicNode = z.infer<typeof LogicNodeSchema>;
export type LogicEdge = z.infer<typeof LogicEdgeSchema>;
export type LogicGraph = z.infer<typeof LogicGraphSchema>;

/** Strip markdown fences and parse + validate a LogicGraph JSON string */
export function parseLogicGraphResponse(raw: string): LogicGraph {
  // Remove ```json ... ``` wrappers if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`LogicGraph JSON parse failed. Raw response:\n${raw.slice(0, 500)}`);
  }

  const result = LogicGraphSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `LogicGraph schema validation failed:\n${result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`
    );
  }
  return result.data;
}
