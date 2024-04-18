import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

// this enables Edge Functions in Vercel
// see https://vercel.com/blog/gpt-3-app-next-js-vercel-edge-functions
// and updated here: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
export const runtime = "edge";

// post a new message and stream OpenAI Assistant response
export async function POST(req, res) {
  // parse message from post
  //   const newMessage = await request.json();
  const newMessage = {
    threadId: "thread_pfiOyD6riHNIXLal270RDdqz",
    content: "What is an elephant?",
    // content: "What is the mass of the sun?",
    assistantId: "asst_nsN6ZIzVHRtkL89Lwyg1deO4",
  };

  // create OpenAI client
  const openai = new OpenAI();

  // if no thread id then create a new openai thread
  if (newMessage.threadId == null) {
    const thread = await openai.beta.threads.create();
    newMessage.threadId = thread.id;
  }

  // add new message to thread
  await openai.beta.threads.messages.create(newMessage.threadId, {
    role: "user",
    content: newMessage.content,
  });

  // create a run
  const run = openai.beta.threads.runs.stream(newMessage.threadId, {
    assistant_id: newMessage.assistantId,
    stream: true,
  });

  run.on("textDelta", (textDelta, snapshot) => {
    console.log("textDelta", textDelta);
    //send back to client
    // res.write(textDelta.value);
  });

  const stream = run.toReadableStream();
  //   console.log("stream", stream);
  return new Response(stream);
  //   return new StreamingTextResponse(stream);
}

const delta = {
  event: "thread.message.delta",
  data: {
    id: "msg_Z8MR4m5ezuUwQCGALBx1mkoe",
    object: "thread.message.delta",
    delta: { content: [{ index: 0, type: "text", text: { value: " one" } }] },
  },
};
