import { NextResponse } from "next/server";
import OpenAI from "openai";
import mongoose from "mongoose";
import assistants from "../../../models/assistants.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**Used in multiple places turn into utility */
const getAssistant = async (assistant_Id) => {
  await mongoose.connect(process.env.MONGODB_URI);
  const assistantList = await assistants.find();

  const assistant = assistantList.filter(
    ({ assistantId }) => assistantId === assistant_Id
  )[0];

  return assistant;
};

const removeThreadFromAssistant = async (assistant_Id, threadId) => {
  const assistant = await getAssistant(assistant_Id);

  if (!assistant) {
    return;
  }

  assistant.threadIds = assistant.threadIds.filter((id) => id !== threadId);

  await assistants.updateOne(
    { assistantId: assistant_Id },
    { threadIds: assistant.threadIds }
  );
};

const deleteThread = async (assistantId, threadId) => {
  const response = await openai.beta.threads.del(threadId);
  removeThreadFromAssistant(assistantId, threadId);
  console.log("deleteThread threadId ==>", threadId);
  return response;
};

export async function DELETE(req, context) {
  const { assistantId } = context.params;
  const payload = await req.json();
  const { threadId } = payload;
  const message = await deleteThread(assistantId, threadId);
  return NextResponse.json({ message });
}
