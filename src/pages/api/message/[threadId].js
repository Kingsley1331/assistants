import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { threadId } = req.query;
    const payload = req.body;
    const { userInput } = payload;

    let streamedResponse = "";
    const { runId, message: userMessage, assistantId } = userInput || {};

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

    if (assistantId) {
      const run = openai.beta.threads.runs
        .stream(threadId, {
          assistant_id: assistantId,
        })
        .on("textDelta", (textDelta, snapshot) => {
          streamedResponse += textDelta.value;
          res.write(textDelta.value);
        })
        .on("connect", () => {
          console.log("================================> Stream connected");
          res.write("");
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
