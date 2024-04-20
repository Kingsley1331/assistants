import { NextResponse } from "next/server";
import OpenAI from "openai";
import { toFile } from "openai/uploads";

const runtime = "edge";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get("audio");
    const file = await toFile(audioBlob, "audio.mp3");

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });
    if (transcription.text) {
      return NextResponse.json({ transcription: transcription.text });
    }
  } catch (error) {
    return NextResponse.error(
      new Error("An error occurred whilst transcribing the audio file"),
      500
    );
  }
}
