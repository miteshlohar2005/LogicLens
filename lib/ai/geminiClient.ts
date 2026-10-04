import { GoogleGenerativeAI } from "@google/generative-ai";

const KEY_1 = process.env.GEMINI_API_KEY_1;
const KEY_2 = process.env.GEMINI_API_KEY_2;

if (!KEY_1 && !KEY_2) {
  console.warn("[geminiClient] No Gemini API keys found. Set GEMINI_API_KEY_1 and GEMINI_API_KEY_2 in .env.local");
}

function createClient(key: string) {
  return new GoogleGenerativeAI(key);
}

/** Which key index is currently in use (1 or 2). Exported so StatusBar can reflect it. */
export let activeKeyIndex: 1 | 2 = 1;

type QuotaError = Error & { status?: number; code?: number };

function isQuotaOrServerError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const e = err as QuotaError;
  const msg = e.message?.toLowerCase() ?? "";
  const status = e.status ?? e.code ?? 0;
  return (
    status === 429 ||
    status === 503 ||
    status === 500 ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource exhausted") ||
    msg.includes("overloaded")
  );
}

/**
 * Returns a Gemini GenerativeModel, automatically failing over from Key 1 → Key 2
 * if Key 1 produces a quota/server error.
 *
 * If `customKey` is provided, it uses that strictly and bypasses the fallback logic.
 */
export async function getModel(
  modelName: string,
  onKeySwitch?: (idx: 1 | 2) => void,
  customKey?: string
) {
  if (customKey) {
    return createClient(customKey).getGenerativeModel({ model: modelName });
  }

  if (!KEY_1 && !KEY_2) throw new Error("No Gemini API keys configured.");

  const tryWithKey = (key: string, idx: 1 | 2) => {
    activeKeyIndex = idx;
    onKeySwitch?.(idx);
    return createClient(key).getGenerativeModel({ model: modelName });
  };

  // If only one key exists, return it directly
  if (!KEY_1) return tryWithKey(KEY_2!, 2);
  if (!KEY_2) return tryWithKey(KEY_1, 1);

  // Both keys available — return a proxy that auto-fails over
  const primaryModel = tryWithKey(KEY_1, 1);

  return new Proxy(primaryModel, {
    get(target, prop) {
      const original = target[prop as keyof typeof target];
      if (typeof original !== "function") return original;

      return async (...args: unknown[]) => {
        try {
          // @ts-expect-error — dynamic proxy
          return await original.apply(target, args);
        } catch (err) {
          if (isQuotaOrServerError(err)) {
            console.warn(`[geminiClient] Key 1 failed (${(err as Error).message}). Switching to Key 2.`);
            const fallbackModel = tryWithKey(KEY_2!, 2);
            const fallbackFn = fallbackModel[prop as keyof typeof fallbackModel];
            if (typeof fallbackFn === "function") {
              // @ts-expect-error — dynamic proxy
              return await fallbackFn.apply(fallbackModel, args);
            }
          }
          throw err;
        }
      };
    },
  });
}

/**
 * Streaming variant — returns the raw Google AI client for streaming calls.
 * The caller must handle key switching manually via the onKeySwitch callback.
 * If `customKey` is provided, it uses that key strictly.
 */
export function getStreamingClient(keyIndex: 1 | 2 = 1, customKey?: string): GoogleGenerativeAI {
  if (customKey) {
    return createClient(customKey);
  }
  const key = keyIndex === 1 ? KEY_1 : KEY_2;
  if (!key) throw new Error(`GEMINI_API_KEY_${keyIndex} is not set.`);
  activeKeyIndex = keyIndex;
  return createClient(key);
}
