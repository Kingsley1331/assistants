import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const runtime = "edge";
// const text = ""The quick brown fox jumps over the lazy dog, not once but twice"";
const textToSpeech = async (text) => {
  console.log(
    "==================================================================================="
  );
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    // voice: "onyx",
    voice: "shimmer",
    // voice: "nova",
    // voice: "fable",
    // voice: "alloy",
    input: text,
  });
  const buffer = Buffer.from(await mp3.arrayBuffer());
  console.log("buffer", buffer);
  return buffer;
};

export async function POST(req) {
  const { text } = await req.json();
  const buffer = await textToSpeech(text);

  return new NextResponse(buffer, {
    headers: { "Content-Type": "application/octet-stream" },
  });
}
