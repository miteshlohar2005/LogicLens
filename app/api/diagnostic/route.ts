import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY_2;
  if (!key) {
    return NextResponse.json({ error: "No API key found in env" }, { status: 500 });
  }
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
