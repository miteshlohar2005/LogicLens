import { type NextRequest } from "next/server";
import { getModel } from "@/lib/ai/geminiClient";
import { buildParseSketchPrompt, buildImagePart, withRetry } from "@/lib/ai/prompts";
import { parseLogicGraphResponse } from "@/lib/schemas/logicGraph";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mimeType = "image/png" } = await request.json() as {
      imageBase64: string;
      mimeType?: "image/png" | "image/jpeg";
    };

    if (!imageBase64) {
      return Response.json({ error: "imageBase64 is required" }, { status: 400 });
    }

    const userKey = request.headers.get("x-user-api-key") ?? undefined;
    const model = await getModel("gemini-1.5-flash", undefined, userKey);

    const logicGraph = await withRetry(
      async () => {
        const result = await model.generateContent([
          buildParseSketchPrompt(),
          buildImagePart(imageBase64, mimeType),
        ]);
        const text = result.response.text();
        return parseLogicGraphResponse(text);
      },
      2,
      "parse-sketch"
    );

    return Response.json({ logicGraph });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[parse-sketch]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
