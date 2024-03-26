import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
// import { converBase64ToImage } from "convert-base64-to-image";
import mongoose from "mongoose";
import OpenAI from "openai";

// const openai = new OpenAI(process.env.OPENAI_API_KEY);
// console.log("OPENAI_API_KEY", process.env.OPENAI_API_KEY);

// export const runtime = "edge";

// const config = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(config);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req, res) {
  const { messages } = await req.json();
  console.log("=======> messages", messages);
  const responseText = await openai.chat.completions.create({
    messages,
    model: "gpt-4-vision-preview",
    max_tokens: 600, // 4096 is the maximum possible
    stream: true,
  });

  const stream = new OpenAIStream(responseText);
  return new StreamingTextResponse(stream);
}
