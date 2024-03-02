import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import mongoose from "mongoose";
// import OpenAI from "openai";

// const openai = new OpenAI(process.env.OPENAI_API_KEY);
// console.log("OPENAI_API_KEY", process.env.OPENAI_API_KEY);

export const runtime = "edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function POST(req) {
  // const payload = await req.json();
  // console.log("payload ==>", payload);
  // let messages;

  // 'data' contains the additional data that you have sent:
  const { messages, data } = await req.json();
  console.log("=======> messages", messages);
  console.log("=======> data", data.imageUrl.substring(0, 50));

  const initialMessages = messages.slice(0, -1);
  const currentMessage = messages[messages.length - 1];

  // if (payload) {
  //   messages = payload.messages;
  //   // messages = [...payload];
  // }
  const chatMessages = [
    ...initialMessages,
    {
      ...currentMessage,
      content: [
        { type: "text", text: currentMessage.content },

        // forward the image information to OpenAI:
        {
          type: "image_url",
          image_url: data.imageUrl,
        },
      ],
    },
  ];

  const response = await openai.createChatCompletion({
    // messages: [
    //   { role: "system", content: "You are a helpful assistant." },
    //   ...messages,
    // ],
    messages: chatMessages,
    stream: true,
    model: "gpt-4-vision-preview",
    max_tokens: 600,
  });

  const stream = new OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
