import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI(process.env.OPENAI_API_KEY);

async function getAssistantIds() {
  const assistantList = (await openai.beta.assistants.list()).data;
  const assistantIds = assistantList.map(({ id, name }) => ({
    id,
    name,
  }));

  return assistantIds;
}

export async function GET(req) {
  const assistantIds = await getAssistantIds();

  if (assistantIds) {
    return NextResponse.json({ assistantIds });
  }
}
