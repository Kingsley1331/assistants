import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI(process.env.OPENAI_API_KEY);
console.log("OPENAI_API_KEY", process.env.OPENAI_API_KEY);

async function chat(req, res, payload) {
  // return [...messages, ...completion.choices.map((choice) => choice.message)];
  // if (payload) {
  //   let sumOfTextStream = "";
  //   let textStream = "";
  //   for await (const chunk of responseText) {
  //     textStream = chunk.choices[0]?.delta?.content || "";
  //     sumOfTextStream += textStream;
  //     res.write(textStream); // Stream the textStream to the client
  //   }
  //   res.end(); // End the response
  // } else {
  //   res.json({
  //     messages: [
  //       ...messages,
  //       ...responseText.choices.map((choice) => choice.message),
  //     ],
  //   });
  // }
}

export async function GET(req) {
  // chat(req, NextResponse);
  // const { payload } = req.body;
  // const payload = await req.json();
  const payload = [{}];

  console.log("payload ==>", payload);
  let messages;
  if (!payload) {
    messages = [{ role: "system", content: "You are a helpful assistant." }];
  }

  if (payload) {
    messages = [...payload];
  }

  const completion = await openai.chat.completions.create({
    messages,
    // model: "gpt-3.5-turbo-1106",
    model: "gpt-4-1106-preview",
  });

  const response = completion.choices[0]?.message?.content;
  console.log(response);
  console.log("choices", completion.choices);
  const message = completion.choices[0]?.message?.content;
  console.log("message", message);
  return NextResponse.json({
    messages: [
      ...messages,
      ...completion.choices.map((choice) => choice.message),
    ],
  });
}

// export async function GET() {
//   return NextResponse.json({ message: "Hello World!" });
// }

export async function POST(req) {
  const payload = await req.json();
  console.log("payload ==>", payload);
  let messages;

  if (payload) {
    messages = payload.messages;
    // messages = [...payload];
  }

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      ...messages,
    ],
    // model: "gpt-3.5-turbo-1106",
    model: "gpt-4-1106-preview",
  });

  return NextResponse.json({
    messages: [
      ...messages,
      ...completion.choices.map((choice) => choice.message),
    ],
  });
}
