import { NextResponse } from "next/server";
import OpenAI from "openai";
import mongoose from "mongoose";
import assistants from "../../../models/assistants.js";

const openai = new OpenAI(process.env.OPENAI_API_KEY);

/**Used in multiple places turn into utility */
const getAssistant = async (assistant_Id) => {
  await mongoose.connect(process.env.MONGODB_URI);
  const assistantList = await assistants.find();

  const assistant = assistantList.filter(
    ({ assistantId }) => assistantId === assistant_Id
  )[0];

  return assistant;
};

const addThreadToAssistant = async (assistant_Id, threadId) => {
  const assistant = await getAssistant(assistant_Id);

  if (!assistant) {
    return;
  }

  await assistants.updateOne(
    { assistantId: assistant_Id },
    { threadIds: [...assistant.threadIds, threadId] }
  );
};

const createThread = async (assistantId) => {
  const thread = await openai.beta.threads.create();
  addThreadToAssistant(assistantId, thread.id);

  return thread;
};

export async function POST(req, context) {
  const { assistantId } = context.params;
  console.log("assistantId2", assistantId);

  const message = await createThread(assistantId);

  if (message) {
    return NextResponse.json({ message });
  }
}
