import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
// import OpenAI from "openai";

// const openai = new OpenAI(process.env.OPENAI_API_KEY);
// console.log("OPENAI_API_KEY", process.env.OPENAI_API_KEY);

export const runtime = "edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function POST(req) {
  const payload = await req.json();
  console.log("payload ==>", payload);
  let messages;

  if (payload) {
    messages = payload.messages;
    // messages = [...payload];
  }

  const response = await openai.createChatCompletion({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      ...messages,
    ],
    stream: true,
    // model: "gpt-3.5-turbo-1106",
    model: "gpt-4-1106-preview",
  });

  const stream = new OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
