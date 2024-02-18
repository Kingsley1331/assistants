import { NextResponse } from "next/server";
import OpenAI from "openai";
import mongoose from "mongoose";
import assistants from "../../../models/assistants.js";

const openai = new OpenAI(process.env.OPENAI_API_KEY);
console.log("OPENAI_API_KEY", process.env.OPENAI_API_KEY);

const getThreads = async (assistant_id) => {
  await mongoose.connect(process.env.MONGODB_URI);
  const assistantList = await assistants.find();
  const threads = assistantList
    .filter(({ assistantId }) => assistantId === assistant_id)
    .map(({ threadIds }) => threadIds)[0];
  return threads;
};

/**Used in multiple places turn into utility */
async function getAssistant(assistant_id) {
  const assistantList = (await openai.beta.assistants.list()).data;
  const assistant = assistantList.filter(({ id }) => id === assistant_id)[0];

  return assistant;
}

export async function GET(req, context) {
  console.log("context", context);
  const { assistantId } = context.params;
  console.log("assistantId", assistantId);

  const assistant = await getAssistant(assistantId);
  const threads = await getThreads(assistantId);
  console.log("assistant", assistant);
  console.log("threads", threads);

  if (assistant) {
    return NextResponse.json({ assistant, threads });
  }
}
