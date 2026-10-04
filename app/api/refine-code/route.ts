import { type NextRequest } from "next/server";
import { getStreamingClient } from "@/lib/ai/geminiClient";
import { buildRefinePrompt, buildImagePart } from "@/lib/ai/prompts";
import { type LogicGraph } from "@/lib/schemas/logicGraph";
import { GeneratedProjectSchema } from "@/lib/schemas/generatedCode";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  function send(data: object): Uint8Array {
    return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
  }

  let keyIndex: 1 | 2 = 1;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { imageBase64, logicGraph, currentFiles, userMessage, mimeType = "image/png" } =
          await request.json() as {
            imageBase64: string;
            logicGraph: LogicGraph;
            currentFiles: Array<{ path: string; content: string }>;
            userMessage: string;
            mimeType?: "image/png" | "image/jpeg";
          };

        if (!imageBase64 || !logicGraph || !currentFiles || !userMessage) {
          controller.enqueue(send({ type: "error", message: "Missing required fields" }));
          controller.close();
          return;
        }

        const prompt = buildRefinePrompt(logicGraph, currentFiles, userMessage);
        const imagePart = buildImagePart(imageBase64, mimeType);

        const userKey = request.headers.get("x-user-api-key") ?? undefined;

        const tryRefine = async (kIdx: 1 | 2) => {
          keyIndex = kIdx;
          const client = getStreamingClient(kIdx, userKey);
          const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
          return model.generateContentStream([prompt, imagePart]);
        };

        const streamChunks = async (kIdx: 1 | 2) => {
          const streamResult = await tryRefine(kIdx);
          
          const iterator = streamResult.stream[Symbol.asyncIterator]();
          const firstResult = await iterator.next();
          
          controller.enqueue(send({ type: "key-active", keyIndex }));
          
          let buf = "";
          if (!firstResult.done) {
            const text = firstResult.value.text();
            buf += text;
            controller.enqueue(send({ type: "chunk", text }));
          }

          while (true) {
            const { done, value } = await iterator.next();
            if (done) break;
            const text = value.text();
            buf += text;
            controller.enqueue(send({ type: "chunk", text }));
          }
          return buf;
        };

        let buffer = "";
        try {
          buffer = await streamChunks(1);
        } catch (err) {
          const msg = (err as Error).message?.toLowerCase() ?? "";
          if (msg.includes("quota") || msg.includes("429") || msg.includes("rate") || msg.includes("overloaded")) {
            if (userKey) {
              throw err; // BYOK has no fallback key, and we are already using the flash model
            } else {
              controller.enqueue(send({ type: "key-switch", keyIndex: 2 }));
              buffer = await streamChunks(2);
            }
          } else {
            throw err;
          }
        }

        try {
          const cleaned = buffer
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
          const parsedJSON = JSON.parse(cleaned);
          const patchedFiles = GeneratedProjectSchema.parse(parsedJSON);
          controller.enqueue(send({ type: "done", patchedFiles }));
        } catch (e) {
          console.warn("Failed to parse or validate patched files", e);
          controller.enqueue(send({ type: "done-raw", text: buffer }));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[refine-code]", message);
        controller.enqueue(send({ type: "error", message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
