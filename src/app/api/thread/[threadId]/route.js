import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getThread(threadId) {
  const messages = await openai.beta.threads.messages.list(threadId);
  return messages;
}

async function getAssistants() {
  const assistantList = (await openai.beta.assistants.list()).data;
  return assistantList;
}

export async function GET(req, context) {
  console.log("context", context);
  const { threadId } = context.params;
  console.log("threadId", threadId);

  const messages = await getThread(threadId);
  const assistantList = (await getAssistants()).map(({ id, name }) => ({
    id,
    name,
  }));

  console.log("==================> assistantList", assistantList);
  console.log("==================> messages", messages);

  return NextResponse.json({ messages, assistantList });
}
