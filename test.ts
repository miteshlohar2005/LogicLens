import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_1 || "");

async function main() {
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  console.log("Model initialized");
}

main().catch(console.error);
