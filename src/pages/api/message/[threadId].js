import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**Used in multiple places turn into utility */
const getAssistants = async () => {
  const assistantList = (await openai.beta.assistants.list()).data;
  //   console.log("assistantList ==>", assistantList);
  return assistantList;
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { threadId } = req.query;
    const payload = req.body;

    const { userInput } = payload;
    const assistantList = await getAssistants();

    let assistant = {};
    let streamedResponse = "";
    const { runId, message: userMessage, assistantId } = userInput || {};

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
    } catch (error) {
      console.error(error);
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

    if (assistant.id) {
      const run = openai.beta.threads.runs
        .stream(threadId, {
          assistant_id: assistant.id,
        })
        .on("textCreated", (text) => {
          console.log(`Response ====> ${text.value}`);
        })
        .on("textDelta", (textDelta, snapshot) => {
          streamedResponse += textDelta.value;
          console.log(snapshot.value);
          res.write(textDelta.value);
        });

      run.on("error", (error) => {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
      });
    } else {
      res.status(400).json({ error: "Assistant ID is required" });
    }
  }
}
