import { z } from "zod";

export const CodeFileSchema = z.object({
  path: z.string(),
  content: z.string(),
});

export const GeneratedProjectSchema = z.array(CodeFileSchema);

export type CodeFile = z.infer<typeof CodeFileSchema>;
export type GeneratedProject = z.infer<typeof GeneratedProjectSchema>;
