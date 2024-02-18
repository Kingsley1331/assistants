import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**Used in multiple places turn into utility */
async function getAssistants() {
  console.log("***********************************************getAssistants");
  const assistantList = (await openai.beta.assistants.list()).data;
  //   console.log("assistantList ==>", assistantList);
  return assistantList;
}

/**Used in multiple places turn into utility */
async function getThread(threadId) {
  console.log("threadId =====================>", threadId);
  const messages = await openai.beta.threads.messages.list(threadId);
  return messages;
}

async function assistantMessage(userInput, threadId) {
  console.log("threadId =====================> 2", threadId);
  const { runId, message: userMessage, assistantId } = userInput || {};
  console.log("userInput ==>", userInput);
  let assistant = {};
  let messageThread;
  let messages;

  const assistantList = await getAssistants();

  try {
    if (!assistantList.length) {
      assistant = await openai.beta.assistants.create({
        name: "Math Tutor2",
        instructions:
          "You are a personal math tutor. Write and run code to answer math questions.",
        tools: [{ type: "code_interpreter" }],
        model: "gpt-4-1106-preview",
        //   file_ids: [file.id]
      });
    } else {
      if (assistantId) {
        assistant = assistantList.filter(
          (assist) => assist.id === assistantId
        )[0];

        console.log("assistant ==>", assistant);
      }
    }

    // Pass in the user question into the existing thread
    if (userInput) {
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: userMessage,
      });
    } else {
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content:
          "Hello there, I'm your personal math tutor. Ask some complicated questions.",
      });
    }

    // Use runs to wait for the assistant response and then retrieve it
    //=================================================================================================
    let lastMessage = "";
    if (assistant.id) {
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistant.id,
      });

      let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

      // Polling mechanism to see if runStatus is completed
      // This should be made more robust. eg should have error handling, also need to exit loop if it takes too long
      while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      }

      // Get the last assistant message from the messages array
      // messages = await openai.beta.threads.messages.list(threadId2);
      messages = await getThread(threadId);

      // Find the last message for the current run
      messageThread = messages.data;

      const lastMessageForRun = messages.data
        .filter(
          (message) => message.run_id === run.id && message.role === "assistant"
        )
        .pop();

      lastMessage = lastMessageForRun.content[0].text.value;
      //   await convertTextToMp3(lastMessage);
    }

    return {
      messages: messageThread,
      message: lastMessage,
      threadId: threadId,
      assistantId: assistant.id || "",
      assistantList,
      runId: "",
    };
  } catch (error) {
    console.error(error);
  }
}

export async function POST(req) {
  const payload = await req.json();
  console.log("payload ==>", payload);
  const { userInput, threadId } = payload;

  const response = await assistantMessage(userInput, threadId);
  //   console.log("response ==>", response);
  let { message, runId, assistantId, assistantList, messages } = response || {};
  messages = messages?.reverse();
  console.log("messages ==>", messages);
  return NextResponse.json({
    message,
    runId,
    assistantId,
    assistantList,
    messages,
  });
}
